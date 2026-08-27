// The server-side endpoint that asks the AI for the three sentences.
//
// This file lives at app/api/picture/route.js, which in the Next.js App Router
// means it answers requests to /api/picture. Exporting a function called POST
// means it answers POST requests.
//
// This code runs on the server, never in the browser. That matters, because
// the API key is here and must never reach the browser.

import { calculateAll } from "../../../lib/calculate.js";
import { validateScreenTime, validateGoal } from "../../../lib/validate.js";
import {
  SYSTEM_PROMPT,
  RESPONSE_SCHEMA,
  buildUserMessage,
} from "../../../lib/prompt.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// How long to wait on any single model before giving up and trying the next.
//
// This started at 30 seconds, which was far too patient. With reasoning
// turned off a healthy model answers in 0.5-3.5s; we measured one free
// provider crawling through 95 tokens in 33.8s, which is queueing, not work.
// Waiting 30s for that -- three times over -- is a 90-second worst case.
//
// 10s is comfortable margin over a healthy response while capping the total
// wait at 30s across all three models.
const TIMEOUT_MS = 10000;

// The models we'll try, in order, until one answers.
//
// Free models on OpenRouter share a pool with every other free user, so any
// one of them can be "temporarily rate-limited upstream" at any moment -- we
// hit this twice within five minutes while building. That isn't a fault we can
// fix, so we work around it: if the first model is busy, try the next.
//
// The first is the best writer of the three. The last is OpenRouter's own
// router, which picks whatever free model is available -- a scrappy last
// resort, since we can't predict which model (or voice) we'll get.
const MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "dots-studio/dots-3-note-preview:free",
  "openrouter/free",
];

// A small helper so every failure leaves this file the same way.
function fail(message, status) {
  return Response.json({ error: message }, { status: status });
}

// Words the user themselves capitalised in their goal -- almost always
// proper nouns ("learn Spanish" tells us Spanish is one).
//
// We ask the prompt to capitalise proper nouns and it doesn't reliably
// listen: it leans so hard on "start lowercase" that it lowercases the whole
// fragment, so cards came back reading "three spanish words". Rather than
// keep arguing with the prompt, we use what the user already told us.
//
// The goal's FIRST word is skipped, because people capitalise the start of
// what they type out of habit ("Learn Spanish") and we don't want to force
// "Learn" into the middle of a sentence. That means a goal like "Spanish for
// travel" is missed -- it fails safe, changing nothing.
function properNounsFrom(goal) {
  return goal
    .trim()
    .split(/\s+/)
    .slice(1)
    .filter((word) => /^[A-Z][a-zA-Z'-]+$/.test(word));
}

// Clean up one fragment of AI text before it reaches the page.
//
// Each card is a sentence we start and the model finishes -- "Tonight — " and
// "By 8 October, " are ours, the rest is theirs. The prompt asks for text
// that slots into that, but instructions don't hold every single time, and
// these three failures are all ones we've actually measured. Guaranteeing
// them here is cheap and always correct; trusting the prompt alone isn't.
function tidyFragment(raw, properNouns) {
  let text = raw.trim();

  // Strip a lead-in the model repeated back at us. We supply "Tonight — "
  // and the real date ourselves, so anything like "tonight, ..." or
  // "by 8 October, ..." arriving here can only be a duplicate. We measured
  // the model working out its own date and writing it in, which rendered as
  // "By 8 October, by 8 October, you've...".
  text = text.replace(/^tonight\s*[,—:-]\s*/i, "");
  text = text.replace(/^by\s+[^,]+,\s*/i, "");

  // Our own prompt examples are written in plain ASCII, so the model
  // sometimes copies that style and returns "--" where it means an em dash.
  // On the page that renders as two visible hyphens.
  text = text.replace(/\s+--\s+/g, " — ");

  // Both fragments continue a sentence we've already begun, so neither
  // should arrive capitalised. The model capitalises anyway often enough
  // that this needs to be enforced rather than requested.
  //
  // One known limit: a fragment that legitimately STARTS with a proper noun
  // ("Spanish has become...") would get flattened to "spanish has
  // become...". In practice these fragments open with a verb or "you've",
  // so it hasn't come up -- and telling proper nouns from ordinary words
  // needs a dictionary we don't have -- except for the proper nouns the
  // user handed us in their own goal, which are restored right below, and
  // which cover the first-word case too.
  text = text.charAt(0).toLowerCase() + text.slice(1);

  // Put the user's own capitalisation back. Done last, so it also fixes a
  // proper noun sitting in first position.
  for (const noun of properNouns) {
    const escaped = noun.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`\\b${escaped}\\b`, "gi"), noun);
  }

  return text;
}

// Ask one model for an answer.
//
// Returns one of three things, so the caller knows what to do next:
//   { status: "ok", text }        -- got a reply
//   { status: "busy" }            -- this model is throttled, try another
//   { status: "failed", message, code } -- give up and tell the visitor
async function askOneModel(model, apiKey, goal, tiers) {
  // Timing, so the server log shows which model answered and how long each
  // attempt took. Without this we can only guess whether a slow request was
  // one slow model or several throttled ones in a row.
  const startedAt = Date.now();
  const elapsed = () => `${((Date.now() - startedAt) / 1000).toFixed(1)}s`;

  // AbortController is how you put a time limit on fetch. Without this, a
  // stalled free model could leave the visitor watching a spinner forever.
  //
  // The timer has to stay running until we've finished reading the reply,
  // not just until fetch() itself resolves. We measured a real request where
  // fetch() came back quickly (headers arrived) but the body then trickled
  // in over 120 seconds -- response.json() has no time limit of its own, so
  // a clearTimeout() placed right after fetch() protects nothing during that
  // second phase. Everything that can be slow -- the request AND reading the
  // reply -- happens inside this one try block, and the timer is only
  // cleared once both are done.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(goal, tiers) },
        ],
        // Turn off the model's "thinking out loud" step.
        //
        // The models we use are reasoning models: left alone they draft and
        // critique their answer before writing it, and we measured that as
        // 64-81% of everything they generated -- text nobody ever sees.
        //
        // Time taken is roughly (tokens generated / how fast the provider is
        // running). We can't control a free provider's speed, but we can cut
        // the work: this drops generation from ~840 tokens to ~150. When the
        // provider is fast you'd barely notice; when it's crawling, that's
        // the difference between an eight-second wait and a two-second one.
        reasoning: { enabled: false },

        // This is the bit that constrains the reply to our schema, rather
        // than us asking for JSON in the prompt and hoping for the best.
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "picture",
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) {
      // Reading .text() on an error response is also covered by the same
      // timeout -- a stalled error body shouldn't hang any less than a
      // stalled success body would.
      const detail = await response.text();
      console.error(
        `[timing] ${model} returned ${response.status} after ${elapsed()}`,
      );
      console.error(detail);

      if (response.status === 429) {
        return { status: "busy" };
      }
      if (response.status === 401) {
        // This looks like "our key is wrong", but we measured it happening
        // on one model in a list where every other model was answering fine
        // seconds earlier -- OpenRouter forwards a free model's own upstream
        // auth hiccup (e.g. "AtlasCloud: unauthorized") as a top-level 401,
        // indistinguishable by status code from our key actually being
        // wrong. Treat it like "busy": try the next model. If EVERY model
        // 401s, that really would mean our key is bad -- this log line is
        // how we'd know.
        console.error(
          `${model} returned 401 -- could be a bad OPENROUTER_API_KEY, or ` +
            "just this model's own upstream provider having a moment.",
        );
        return { status: "busy" };
      }
      if (response.status === 402) {
        return {
          status: "failed",
          message: "The free allowance has run out for today.",
          code: 402,
        };
      }
      // Anything else might just be this one model misbehaving.
      return { status: "busy" };
    }

    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content;
    const generated = payload?.usage?.completion_tokens ?? "?";

    if (!text) {
      console.error(
        `[timing] ${model} sent an empty reply after ${elapsed()}`,
      );
      return { status: "busy" };
    }

    console.log(
      `[timing] ${model} answered in ${elapsed()} (${generated} tokens)`,
    );
    return { status: "ok", text: text };
  } catch (error) {
    if (error.name === "AbortError") {
      // A slow model is much like a busy one: worth trying the next.
      console.error(`[timing] ${model} timed out after ${elapsed()}`);
      return { status: "busy" };
    }
    console.error(`Could not reach OpenRouter for ${model}:`, error);
    return {
      status: "failed",
      message: "Couldn't reach the service. Please try again.",
      code: 502,
    };
  } finally {
    // Always clear the timer, whether we succeeded or failed -- and now this
    // only runs once the whole exchange (request + reading the reply) is
    // actually finished.
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  const requestStartedAt = Date.now();

  // ---------------------------------------------------------------------
  // 1. Read and check what was sent
  //
  // The browser already checked all of this before sending. We check it
  // again anyway, because anyone can POST to this address directly and skip
  // the browser entirely. Never trust the client.
  // ---------------------------------------------------------------------
  let body;
  try {
    body = await request.json();
  } catch {
    return fail("That request didn't make sense.", 400);
  }

  const goalCheck = validateGoal(body?.goal);
  if (!goalCheck.ok) {
    return fail(goalCheck.message, 400);
  }

  const timeCheck = validateScreenTime(body?.hours, body?.minutes);
  if (!timeCheck.ok) {
    return fail(timeCheck.message, 400);
  }

  // We recalculate the hours here rather than trusting numbers sent by the
  // browser. Same input, same maths, same answer -- but now we know it wasn't
  // tampered with on the way in.
  const tiers = calculateAll(timeCheck.totalMinutes);

  // ---------------------------------------------------------------------
  // 2. Ask the AI, trying each model until one answers
  // ---------------------------------------------------------------------

  // Checked here, at the point of use, rather than at the top of the file.
  // A bad request deserves a 400 whether or not our key is configured.
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    // This one is our fault, not the visitor's, so we log it loudly for us
    // and say something vague and calm to them.
    console.error("OPENROUTER_API_KEY is not set. Add it to .env.local");
    return fail("The server isn't set up yet. Try again later.", 500);
  }

  let text = null;

  for (const model of MODELS) {
    const attempt = await askOneModel(model, apiKey, goalCheck.goal, tiers);

    if (attempt.status === "ok") {
      text = attempt.text;
      break;
    }
    if (attempt.status === "failed") {
      return fail(attempt.message, attempt.code);
    }
    // "busy" -- fall through and try the next model.
  }

  if (text === null) {
    console.error("Every model was busy.");
    return fail("Everything's busy right now. Try again in a minute.", 503);
  }

  // ---------------------------------------------------------------------
  // 3. Unpack the reply
  //
  // Even with a schema, we check every step. A free model can return an empty
  // reply, or stop halfway through a sentence and leave broken JSON behind.
  // ---------------------------------------------------------------------
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error("Reply wasn't valid JSON:", text);
    return fail("Got a confusing answer. Please try again.", 502);
  }

  // Check we got exactly the three lines we asked for, one per tier, and
  // that each is a non-empty string. If the shape is wrong we'd rather show
  // an error than render three blank cards.
  const lines = parsed?.lines;

  if (!Array.isArray(lines) || lines.length !== tiers.length) {
    console.error("Wrong number of lines:", text);
    return fail("Got an incomplete answer. Please try again.", 502);
  }

  // Each tier needs both halves. If either is missing we'd rather show an
  // error than render a card with one rung silently blank.
  const properNouns = properNounsFrom(goalCheck.goal);

  const stepsByPercent = {};
  for (const line of lines) {
    const hasBoth =
      typeof line?.tonight === "string" &&
      line.tonight.trim() !== "" &&
      typeof line?.byThen === "string" &&
      line.byThen.trim() !== "";

    if (!hasBoth) {
      console.error("A line was missing tonight or byThen:", text);
      return fail("Got an incomplete answer. Please try again.", 502);
    }

    stepsByPercent[line.percent] = {
      tonight: tidyFragment(line.tonight, properNouns),
      byThen: tidyFragment(line.byThen, properNouns),
    };
  }

  // Put them back in our tier order rather than trusting the order they
  // arrived in, and confirm every tier actually got one.
  const ordered = tiers.map((tier) => stepsByPercent[tier.percent]);

  if (ordered.some((step) => step === undefined)) {
    console.error("A tier had no matching line:", text);
    return fail("Got an incomplete answer. Please try again.", 502);
  }

  const totalSeconds = ((Date.now() - requestStartedAt) / 1000).toFixed(1);
  console.log(`[timing] whole request took ${totalSeconds}s`);

  return Response.json({ steps: ordered });
}
