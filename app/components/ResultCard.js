import styles from "./ResultCard.module.css";

// A single result card. No state, no logic -- it just displays the three
// values it's handed. All the maths already happened in lib/calculate.js.
export default function ResultCard({
  percent,
  perDayLabel,
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
      <p className={styles.percent}>Give up {percent}%</p>
      <p className={styles.perDay}>{perDayLabel} a day</p>

      {/* The date leads and does the emotional work -- it puts a real
          calendar date on the outcome. The scene is the AI's job; the date
          and hours are ours, calculated locally, never repeated by the AI. */}
      {achievement && (
        <p className={styles.sentence}>
          By <span className={styles.date}>{endDate}</span>, you could be{" "}
          {achievement}.
        </p>
      )}

      {/* While waiting on the AI, the date still shows -- it's already
          known -- with a quiet placeholder standing in for the scene. */}
      {pending && !achievement && (
        <p className={`${styles.sentence} ${styles.sentencePending}`}>
          By <span className={styles.date}>{endDate}</span>, you could
          be&hellip;
        </p>
      )}

      {/* The hours, kept as quiet supporting text rather than the headline
          figure -- present for anyone who wants the receipt, easy to skip
          past for anyone who doesn't. */}
      {achievement && (
        <p className={styles.hoursFootnote}>{totalHours} hours reclaimed</p>
      )}
    </div>
  );
}
