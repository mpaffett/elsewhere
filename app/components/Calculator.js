"use client";

import { useState } from "react";

import { calculateAll } from "../../lib/calculate.js";
import { validateGoal, validateScreenTime } from "../../lib/validate.js";
import ResultCard from "./ResultCard.js";
import styles from "./Calculator.module.css";

export default function Calculator() {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  // The AI's achievement phrases, and the two bits of state that go with any
  // request that leaves the browser: is it in flight, and did it go wrong?
  const [achievements, setAchievements] = useState(null);
  const [picturePending, setPicturePending] = useState(false);
  const [pictureError, setPictureError] = useState("");

  async function handleSubmit(event) {
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

    // The numbers appear immediately -- they're free, local maths. The AI
    // sentences take a few seconds, so they're fetched next and fill in
    // underneath once they arrive, rather than making the visitor wait for
    // both before seeing anything.
    setResults({
      goal: goalCheck.goal,
      cards: calculateAll(screenTime.totalMinutes),
    });

    setAchievements(null);
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
        setPictureError(body.error || "Something went wrong. Please try again.");
        return;
      }

      setAchievements(body.achievements);
    } catch {
      // This only happens if the network itself failed.
      setPictureError("Couldn't reach the server. Please try again.");
    } finally {
      setPicturePending(false);
    }
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

        {/* Disabled while a picture request is still in flight, so a second
            click can't fire an overlapping fetch and mix up two answers. */}
        <button type="submit" className={styles.submit} disabled={picturePending}>
          Show me
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {results && (
        <section className={styles.results}>
          <p className={styles.towards}>Toward: {results.goal}</p>
          <div className={styles.cardRow}>
            {results.cards.map((card, index) => (
              <ResultCard
                key={card.percent}
                delayIndex={index}
                achievement={achievements ? achievements[index] : null}
                pending={picturePending}
                {...card}
              />
            ))}
          </div>

          {pictureError && <p className={styles.error}>{pictureError}</p>}
        </section>
      )}
    </div>
  );
}
