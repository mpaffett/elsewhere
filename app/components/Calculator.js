"use client";

import { useEffect, useRef, useState } from "react";

import { costOverLifetime, formatDuration } from "../../lib/calculate.js";
import { validateScreenTime } from "../../lib/validate.js";
import CostTotals from "./CostTotals.js";
import DailyAsk from "./DailyAsk.js";
import { ArrowIcon } from "./Icons.js";
import GoalPicker from "./GoalPicker.js";
import PlanOffer from "./PlanOffer.js";
import styles from "./Calculator.module.css";

// The three stages of the flow, in order. Sections accumulate down the page
// as a visitor reaches each one rather than replacing what came before --
// the numbers they've already agreed to (their own screen time, the cost of
// it) stay on screen while they answer the next question, which is what
// makes each question feel earned rather than just the next field in a form.
const STAGE = {
  SCREEN_TIME: "screenTime",
  GOAL: "goal",
  DAILY_ASK: "dailyAsk",
};

// How long a new section gets to sit alone before the next one appears
// underneath it. Used for every transition below -- the cost card's own
// fade-in animation (see CostTotals.module.css) takes 500ms, so this
// matches that: each new section shows up right as the previous one
// finishes settling, rather than racing it.
const REVEAL_DELAY_MS = 500;

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
  // The validated total, kept once step 1 is answered so later steps don't
  // have to re-parse the raw fields.
  const [screenTimeMinutes, setScreenTimeMinutes] = useState(null);

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedDailyAsk, setSelectedDailyAsk] = useState(null);

  const costSectionRef = useRef(null);
  const goalSectionRef = useRef(null);
  const dailyAskSectionRef = useRef(null);

  // Holds whichever "reveal the next section" timer is currently pending.
  // Only one is ever pending at a time in this linear flow, so one shared
  // ref covers every transition rather than needing one per stage.
  const revealTimeout = useRef(null);

  // Cancel a pending reveal if the visitor navigates away mid-delay.
  useEffect(() => {
    return () => {
      clearTimeout(revealTimeout.current);
    };
  }, []);

  // Keep whatever the visitor just reached centred on screen, rather than
  // just scrolled into view at the top edge -- "central" is what makes it
  // read as the thing to look at right now, not just the next item in a
  // long page. block: "center" does that scrolling for us; we only have to
  // decide which section is the current one.
  //
  // The cost numbers get their own effect below, separate from this one,
  // because they appear the instant costRows is set -- before `stage` has
  // moved past SCREEN_TIME during the reveal delay. This effect only knows
  // about `stage`, so it can't see that moment.
  useEffect(() => {
    const ref =
      stage === STAGE.GOAL
        ? goalSectionRef
        : stage === STAGE.DAILY_ASK
          ? dailyAskSectionRef
          : null;

    if (ref && ref.current && prefersMotion()) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [stage]);

  useEffect(() => {
    if (costRows && costSectionRef.current && prefersMotion()) {
      costSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [costRows]);

  // Everything from step 2 onward is derived from the screen-time total, so
  // if the visitor edits the hours or minutes after moving past step 1,
  // all of it is stale. Rather than try to patch it, we clear it and send
  // them back to the start of the flow -- one rule, easy to trust: nothing
  // shown can be out of step with the number at the top of the page.
  function resetPastScreenTime() {
    // Cancel any reveal still waiting to happen, and clear the cost numbers
    // that go with it. Both of those exist the instant "Show me" is
    // pressed, before `stage` itself has moved past SCREEN_TIME during the
    // reveal delay -- so they can't be gated on `stage` below, or an edit
    // made inside that short window would leave the old cost numbers on
    // screen next to the new hours and minutes.
    clearTimeout(revealTimeout.current);
    setCostRows(null);
    setScreenTimeMinutes(null);

    if (stage === STAGE.SCREEN_TIME) {
      return;
    }
    setStage(STAGE.SCREEN_TIME);
    setSelectedGoal(null);
    setSelectedDailyAsk(null);
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
      revealTimeout.current = setTimeout(() => {
        setStage(STAGE.GOAL);
      }, REVEAL_DELAY_MS);
    }
  }

  function handleGoalSelect(goalId) {
    setSelectedGoal(goalId);

    // Changing the goal invalidates whichever daily commitment was picked
    // for the old one -- same reasoning as resetPastScreenTime, one level
    // down: nothing shown can be out of step with what's chosen above it.
    setSelectedDailyAsk(null);

    // Only step forward. If the visitor picks a different goal after
    // already reaching the daily-ask step, that step is already on screen
    // -- no need to reveal it again, just clear the stale selection above.
    if (stage === STAGE.GOAL) {
      revealTimeout.current = setTimeout(() => {
        setStage(STAGE.DAILY_ASK);
      }, REVEAL_DELAY_MS);
    }
  }

  function handleDailyAskSelect(option) {
    setSelectedDailyAsk(option);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <section className={styles.step}>
          <div className={styles.stepHeaderRow}>
            <div className={styles.stepHeaderLeft}>
              <span className={styles.stepNumber}>1</span>
              <h2 className={styles.stepLabel}>
                Step 1: Your daily screen time
              </h2>
            </div>
            {screenTimeMinutes && (
              <span className={styles.stepNote}>
                {formatDuration(screenTimeMinutes)} a day
              </span>
            )}
          </div>

          <form className={styles.form} onSubmit={handleScreenTimeSubmit}>
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

            <button type="submit" className={styles.submit}>
              Show me
              <ArrowIcon className={styles.submitIcon} />
            </button>
          </form>

          {timeError && <p className={styles.error}>{timeError}</p>}
        </section>

        {/* The cost section: what that screen time adds up to this week,
            this month, this year. It's local maths, so it appears the
            instant step 1 is answered. */}
        {costRows && (
          <section ref={costSectionRef} className={styles.costSection}>
            <CostTotals rows={costRows} />
          </section>
        )}

        {stage !== STAGE.SCREEN_TIME && (
          <section
            ref={goalSectionRef}
            className={`${styles.step} ${styles.reveal}`}
          >
            <div className={styles.stepHeaderRow}>
              <div className={styles.stepHeaderLeft}>
                <span className={styles.stepNumber}>2</span>
                <h2 className={styles.stepLabel}>
                  Step 2: What will you make this week?
                </h2>
              </div>
            </div>
            <GoalPicker
              selectedId={selectedGoal}
              onSelect={handleGoalSelect}
              className={styles.cardRow}
            />
          </section>
        )}

        {stage === STAGE.DAILY_ASK && screenTimeMinutes && (
          <section
            ref={dailyAskSectionRef}
            className={`${styles.step} ${styles.reveal}`}
          >
            <div className={styles.stepHeaderRow}>
              <div className={styles.stepHeaderLeft}>
                <span className={styles.stepNumber}>3</span>
                <h2 className={styles.stepLabel}>
                  Step 3: How much can you give it each day?
                </h2>
              </div>
            </div>
            <DailyAsk
              totalMinutes={screenTimeMinutes}
              selectedPercent={
                selectedDailyAsk ? selectedDailyAsk.percent : null
              }
              onSelect={handleDailyAskSelect}
              className={styles.cardRow}
            />
          </section>
        )}
      </div>

      {/* The real offer, once a daily commitment is picked -- see
          PlanOffer.js. Sits outside the panel as its own card, same
          pattern as the inner emphasis box in the Stitch design. */}
      {selectedDailyAsk && (
        <section className={`${styles.offerSection} ${styles.reveal}`}>
          <PlanOffer goalId={selectedGoal} dailyAsk={selectedDailyAsk} />
        </section>
      )}
    </div>
  );
}
