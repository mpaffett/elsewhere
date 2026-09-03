"use client";

import { useEffect, useRef, useState } from "react";

import { calculateAll, costOverLifetime } from "../../lib/calculate.js";
import { validateGoal, validateScreenTime } from "../../lib/validate.js";
import CostTotals from "./CostTotals.js";
import EmailCapture from "./EmailCapture.js";
import ResultCard from "./ResultCard.js";
import styles from "./Calculator.module.css";

// The three stages of the flow, in order. Sections accumulate down the page
// as a visitor reaches each one rather than replacing what came before --
// the numbers they've already agreed to (their own screen time, the cost of
// it) stay on screen while they answer the next question, which is what
// makes each question feel earned rather than just the next field in a form.
const STAGE = {
  SCREEN_TIME: "screenTime",
  GOAL: "goal",
  RESULTS: "results",
};

// True unless the visitor has asked for less motion. Guards every
// scrollIntoView call below -- without it, a new section can land below the
// fold and the pacing reads as nothing having happened.
function prefersMotion() {
  if (typeof window === "undefined") {
    return true;
  }
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Calculator() {
  const [stage, setStage] = useState(STAGE.SCREEN_TIME);

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [timeError, setTimeError] = useState("");
  const [costRows, setCostRows] = useState(null);
  // The validated total, kept once step 1 is answered so step 2 doesn't have
  // to re-parse the raw fields to run calculateAll.
  const [screenTimeMinutes, setScreenTimeMinutes] = useState(null);

  const [goal, setGoal] = useState("");
  const [goalError, setGoalError] = useState("");
  const [results, setResults] = useState(null);

  // The AI's two-rung steps (tonight + byThen per tier), and the two bits of
  // state that go with any request that leaves the browser: is it in flight,
  // and did it go wrong?
  const [steps, setSteps] = useState(null);
  const [picturePending, setPicturePending] = useState(false);
  const [pictureError, setPictureError] = useState("");

  const goalSectionRef = useRef(null);
  const resultsRef = useRef(null);

  // Scroll each new section into view as the visitor reaches it, so the
  // pacing is visible rather than happening below the fold.
  useEffect(() => {
    const ref =
      stage === STAGE.GOAL
        ? goalSectionRef
        : stage === STAGE.RESULTS
          ? resultsRef
          : null;

    if (ref && ref.current && prefersMotion()) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stage]);

  // Everything from step 2 onward is derived from the screen-time total, so
  // if the visitor edits the hours or minutes after moving past step 1,
  // all of it is stale. Rather than try to patch it, we clear it and send
  // them back to the start of the flow -- one rule, easy to trust: nothing
  // shown can be out of step with the number at the top of the page.
  function resetPastScreenTime() {
    if (stage === STAGE.SCREEN_TIME) {
      return;
    }
    setStage(STAGE.SCREEN_TIME);
    setCostRows(null);
    setScreenTimeMinutes(null);
    setGoal("");
    setGoalError("");
    setResults(null);
    setSteps(null);
    setPictureError("");
  }

  function handleHoursChange(event) {
    resetPastScreenTime();
    setHours(event.target.value);
  }

  function handleMinutesChange(event) {
    resetPastScreenTime();
    setMinutes(event.target.value);
  }

  function handleScreenTimeSubmit(event) {
    event.preventDefault();

    const screenTime = validateScreenTime(hours, minutes);
    if (!screenTime.ok) {
      setTimeError(screenTime.message);
      return;
    }

    setTimeError("");
    setScreenTimeMinutes(screenTime.totalMinutes);
    setCostRows(costOverLifetime(screenTime.totalMinutes));

    // Only step forward. If the visitor re-submits without having changed
    // anything, there's nothing to actually reset -- leave them wherever
    // they already are rather than snapping the page back to this question.
    if (stage === STAGE.SCREEN_TIME) {
      setStage(STAGE.GOAL);
    }
  }

  async function handleGoalSubmit(event) {
    event.preventDefault();

    const goalCheck = validateGoal(goal);
    if (!goalCheck.ok) {
      setGoalError(goalCheck.message);
      return;
    }

    setGoalError("");

    // The numbers appear immediately -- they're free, local maths. The AI
    // sentences take a few seconds, so they're fetched next and fill in
    // underneath once they arrive, rather than making the visitor wait for
    // both before seeing anything.
    setResults({ cards: calculateAll(screenTimeMinutes) });
    setStage(STAGE.RESULTS);

    setSteps(null);
    setPictureError("");
    setPicturePending(true);

    try {
      const response = await fetch("/api/picture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal, hours: hours, minutes: minutes }),
      });

      const body = await response.json();

      if (!response.ok) {
        // The server always sends a readable message, so we can show it
        // straight to the visitor rather than inventing our own wording.
        setPictureError(
          body.error || "Something went wrong. Please try again.",
        );
        return;
      }

      setSteps(body.steps);
    } catch {
      // This only happens if the network itself failed.
      setPictureError("Couldn't reach the server. Please try again.");
    } finally {
      setPicturePending(false);
    }
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleScreenTimeSubmit}>
        <fieldset className={styles.field}>
          <legend className={styles.label}>
            What&rsquo;s your daily screen time?
          </legend>
          <div className={styles.timeInputs}>
            <label className={styles.timeInput}>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={hours}
                onChange={handleHoursChange}
              />
              <span>hours</span>
            </label>
            <label className={styles.timeInput}>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={minutes}
                onChange={handleMinutesChange}
              />
              <span>minutes</span>
            </label>
          </div>
          <p className={styles.hint}>
            You&rsquo;ll find this in Settings &rarr; Screen Time.
          </p>
        </fieldset>

        <button type="submit" className={styles.submit}>
          Show me
        </button>
      </form>

      {timeError && <p className={styles.error}>{timeError}</p>}

      {/* The cost section: what that screen time adds up to over 1, 5 and
          30 years. It's local maths, so it appears the instant step 1 is
          answered, before any network request exists to wait on. */}
      {costRows && (
        <section className={styles.costSection}>
          <CostTotals rows={costRows} />
        </section>
      )}

      {stage !== STAGE.SCREEN_TIME && (
        <form
          ref={goalSectionRef}
          className={`${styles.form} ${styles.goalForm}`}
          onSubmit={handleGoalSubmit}
        >
          <label className={styles.field}>
            <span className={styles.label}>
              If you could send some of this time elsewhere, where would you
              send it?
            </span>
            <input
              type="text"
              className={styles.goalInput}
              placeholder="learn Spanish"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            />
            <p className={styles.hint}>
              The more specific the better &mdash; &ldquo;get back into
              guitar&rdquo; beats &ldquo;learn guitar&rdquo;.
            </p>
          </label>

          {/* Disabled while a picture request is still in flight, so a
              second click can't fire an overlapping fetch and mix up two
              answers. */}
          <button
            type="submit"
            className={styles.submit}
            disabled={picturePending}
          >
            Show me
          </button>
        </form>
      )}

      {goalError && <p className={styles.error}>{goalError}</p>}

      {results && (
        <section ref={resultsRef} className={styles.results}>
          <p className={styles.resultsIntro}>
            Here&rsquo;s what sending some of that time elsewhere could look
            like.
          </p>
          <div className={styles.cardRow}>
            {results.cards.map((card, index) => (
              <ResultCard
                key={card.percent}
                delayIndex={index}
                step={steps ? steps[index] : null}
                pending={picturePending}
                {...card}
              />
            ))}
          </div>

          {pictureError && <p className={styles.error}>{pictureError}</p>}
        </section>
      )}

      {/* The next step in the journey, once the cards are on screen -- this
          doesn't wait for the AI sentences to finish loading, only for the
          cards themselves to exist. Placeholder for now: see
          EmailCapture.js. */}
      {results && (
        <section className={styles.emailSection}>
          <EmailCapture />
        </section>
      )}
    </div>
  );
}
