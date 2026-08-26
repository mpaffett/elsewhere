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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(OPENROUTER_URL, {
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
    // Always clear the timer, whether we succeeded or failed.
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error(
      `[timing] ${model} returned ${response.status} after ${elapsed()}`,
    );
    console.error(detail);

    if (response.status === 429) {
      return { status: "busy" };
    }
    if (response.status === 401) {
      // This looks like "our key is wrong", but we measured it happening on
      // one model in a list where every other model was answering fine
      // seconds earlier -- OpenRouter forwards a free model's own upstream
      // auth hiccup (e.g. "AtlasCloud: unauthorized") as a top-level 401,
      // indistinguishable by status code from our key actually being wrong.
      // Treat it like "busy": try the next model. If EVERY model 401s, that
      // really would mean our key is bad -- this log line is how we'd know.
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
    console.error(`[timing] ${model} sent an empty reply after ${elapsed()}`);
    return { status: "busy" };
  }

  console.log(
    `[timing] ${model} answered in ${elapsed()} (${generated} tokens)`,
  );
  return { status: "ok", text: text };
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

  const achievementsByPercent = {};
  for (const line of lines) {
    if (
      typeof line?.achievement !== "string" ||
      line.achievement.trim() === ""
    ) {
      console.error("A line was empty:", text);
      return fail("Got an incomplete answer. Please try again.", 502);
    }
    achievementsByPercent[line.percent] = line.achievement.trim();
  }

  // Put them back in our tier order rather than trusting the order they
  // arrived in, and confirm every tier actually got one.
  const ordered = tiers.map((tier) => achievementsByPercent[tier.percent]);

  if (ordered.some((achievement) => achievement === undefined)) {
    console.error("A tier had no matching line:", text);
    return fail("Got an incomplete answer. Please try again.", 502);
  }

  const totalSeconds = ((Date.now() - requestStartedAt) / 1000).toFixed(1);
  console.log(`[timing] whole request took ${totalSeconds}s`);

  return Response.json({ achievements: ordered });
}
