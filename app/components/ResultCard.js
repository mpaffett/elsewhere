import styles from "./ResultCard.module.css";

// A single result card. No state, no logic -- it just displays the three
// values it's handed. All the maths already happened in lib/calculate.js.
export default function ResultCard({
  percent,
  perDayLabel,
  proportionLabel,
  totalHours,
  endDate,
  delayIndex,
  achievement,
  pending,
}) {
  return (
    <div
      className={`${styles.card} ${styles[`card${percent}`]}`}
      style={{ animationDelay: `${delayIndex * 90}ms` }}
    >
      {/* The headline is the ask and the promise in one line. "Elsewhere"
          is the destination the time goes to -- the whole premise is that
          the time isn't lost, it's redirected, so the card never says
          "give up". The proportion sits underneath as context for how big
          an ask this is relative to their current habit. */}
      <p className={styles.perDay}>{perDayLabel} a day, elsewhere</p>
      <p className={styles.proportion}>
        that&rsquo;s {proportionLabel} of your screen time
      </p>

      {/* The date leads and does the emotional work -- it puts a real
          calendar date on the outcome. The rest of the sentence, including
          its own "You've..." and full stop, is the AI's job; the date and
          hours are ours, calculated locally, never repeated by the AI. */}
      {achievement && (
        <p className={styles.sentence}>
          By <span className={styles.date}>{endDate}</span>, {achievement}
        </p>
      )}

      {/* While waiting on the AI, the date still shows -- it's already
          known -- with a quiet placeholder standing in for the result. */}
      {pending && !achievement && (
        <p className={`${styles.sentence} ${styles.sentencePending}`}>
          By <span className={styles.date}>{endDate}</span>&hellip;
        </p>
      )}

      {/* The hours, kept as quiet supporting text rather than the headline
          figure -- present for anyone who wants the receipt, easy to skip
          past for anyone who doesn't. */}
      {achievement && (
        <p className={styles.hoursFootnote}>{totalHours} hours elsewhere</p>
      )}
    </div>
  );
}
