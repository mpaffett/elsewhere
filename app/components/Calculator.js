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

// Two stages, not three. Steps 2 and 3 (goal, daily-ask) reveal together as
// soon as screen time is answered, rather than one-after-the-other -- the
// only wait that's unavoidable is the first one, since daily-ask's minutes
// are a percentage of a number that doesn't exist until step 1 is answered.
// See the "all-at-once" layout test discussed 2026-09-16.
const STAGE = {
  SCREEN_TIME: "screenTime",
  ANSWERED: "answered",
};

// How long the answered steps wait before appearing, once screen time is
// submitted. Matches the cost card's own fade-in (CostTotals.module.css),
// so step 1's numbers finish settling right as steps 2 and 3 show up.
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

  // Holds the single pending "reveal steps 2 and 3" timer, if one is
  // waiting. Only ever one at a time now that there's only one reveal left.
  const revealTimeout = useRef(null);

  // Cancel a pending reveal if the visitor navigates away mid-delay.
  useEffect(() => {
    return () => {
      clearTimeout(revealTimeout.current);
    };
  }, []);

  // Keep steps 2 and 3 centred on screen the moment they appear, rather
  // than just scrolled into view at the top edge -- "central" is what makes
  // it read as the thing to look at now, not just more of the page.
  //
  // The cost numbers get their own effect below, separate from this one,
  // because they appear the instant costRows is set -- before `stage` has
  // moved past SCREEN_TIME during the reveal delay. This effect only knows
  // about `stage`, so it can't see that moment.
  useEffect(() => {
    if (stage === STAGE.ANSWERED && goalSectionRef.current && prefersMotion()) {
      goalSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
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
        setStage(STAGE.ANSWERED);
      }, REVEAL_DELAY_MS);
    }
  }

  function handleGoalSelect(goalId) {
    setSelectedGoal(goalId);

    // Changing the goal invalidates whichever daily commitment was picked
    // for the old one -- same reasoning as resetPastScreenTime, one level
    // down: nothing shown can be out of step with what's chosen above it.
    // No stage change needed here any more -- step 3 is already on screen
    // alongside step 2, so there's nothing left to reveal.
    setSelectedDailyAsk(null);
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
            <div className={styles.formRow}>
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

              <button type="submit" className={styles.submit}>
                Go
                <ArrowIcon className={styles.submitIcon} />
              </button>
            </div>

            <p className={styles.hint}>
              You&rsquo;ll find this in Settings &rarr; Screen Time.
            </p>
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

        {/* Steps 2 and 3 reveal together -- see the STAGE comment above for
            why there's no longer a separate wait between them. */}
        {stage === STAGE.ANSWERED && (
          <>
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

            <section className={`${styles.step} ${styles.reveal}`}>
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
          </>
        )}
      </div>

      {/* The real offer, once BOTH a goal and a daily commitment are
          picked -- see PlanOffer.js. Sits outside the panel as its own
          card, same pattern as the inner emphasis box in the Stitch
          design.

          Both are required now that steps 2 and 3 reveal together instead
          of one gating the other: a visitor can reach step 3 and pick a
          daily-ask amount before ever choosing a goal, so PlanOffer can't
          assume selectedGoal is set just because selectedDailyAsk is. */}
      {selectedGoal && selectedDailyAsk && (
        <section className={`${styles.offerSection} ${styles.reveal}`}>
          <PlanOffer goalId={selectedGoal} dailyAsk={selectedDailyAsk} />
        </section>
      )}
    </div>
  );
}
