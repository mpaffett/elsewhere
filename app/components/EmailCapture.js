"use client";

import styles from "./EmailCapture.module.css";

// Placeholder only -- there's no email service wired up yet, and this
// doesn't go anywhere when submitted. It exists so Matt can see the real
// size, spacing, and colour of this section on the actual page before
// deciding what it should say and do. The copy, the field, and the button
// are all throwaway and expected to change once the £9 offer is designed.
export default function EmailCapture() {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <p className={styles.title}>Enter your email for more</p>
      <input
        type="email"
        className={styles.emailInput}
        placeholder="you@example.com"
      />
      <button type="submit" className={styles.submit}>
        Submit
      </button>
    </form>
  );
}
