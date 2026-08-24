"use client";

import { useState } from "react";

import { calculateAll, horizonEndDate } from "../../lib/calculate.js";
import { validateGoal, validateScreenTime } from "../../lib/validate.js";
import ResultCard from "./ResultCard.js";
import styles from "./Calculator.module.css";

export default function Calculator() {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();

    const screenTime = validateScreenTime(hours, minutes);
    if (!screenTime.ok) {
      setError(screenTime.message);
      setResults(null);
      return;
    }

    const goalCheck = validateGoal(goal);
    if (!goalCheck.ok) {
      setError(goalCheck.message);
      setResults(null);
      return;
    }

    setError("");
    setResults({
      goal: goalCheck.goal,
      cards: calculateAll(screenTime.totalMinutes),
      endDate: horizonEndDate(),
    });
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <fieldset className={styles.field}>
          <legend className={styles.label}>What&rsquo;s your daily screen time?</legend>
          <div className={styles.timeInputs}>
            <label className={styles.timeInput}>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
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
                onChange={(event) => setMinutes(event.target.value)}
              />
              <span>minutes</span>
            </label>
          </div>
          <p className={styles.hint}>
            You&rsquo;ll find this in Settings &rarr; Screen Time.
          </p>
        </fieldset>

        <label className={styles.field}>
          <span className={styles.label}>
            What would you love to make progress on if you had more time?
          </span>
          <input
            type="text"
            className={styles.goalInput}
            placeholder="learn Spanish"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />
        </label>

        <button type="submit" className={styles.submit}>
          Show me
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {results && (
        <section className={styles.results}>
          <p className={styles.towards}>Toward: {results.goal}</p>
          <div className={styles.cardRow}>
            {results.cards.map((card, index) => (
              <ResultCard key={card.percent} delayIndex={index} {...card} />
            ))}
          </div>
          <p className={styles.endDate}>That&rsquo;s by {results.endDate}.</p>
        </section>
      )}
    </div>
  );
}
