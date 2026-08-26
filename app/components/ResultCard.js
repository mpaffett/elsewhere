import styles from "./ResultCard.module.css";

// A single result card. No state, no logic -- it just displays the three
// values it's handed. All the maths already happened in lib/calculate.js.
export default function ResultCard({
  percent,
  perDayLabel,
  totalHours,
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

      {/* The hours are ours -- calculated locally, always correct, and
          never repeated by the AI. Only the "to spend on ___" part is the
          AI's job, so the sentence assembles itself from two sources. */}
      {achievement && (
        <p className={styles.sentence}>
          Over 12 weeks you&rsquo;d regain{" "}
          <span className={styles.totalNumber}>{totalHours}</span> hours to
          spend on {achievement}.
        </p>
      )}

      {/* While waiting on the AI, still show the number -- it's already
          known -- with a quiet placeholder standing in for the achievement. */}
      {pending && !achievement && (
        <p className={`${styles.sentence} ${styles.sentencePending}`}>
          Over 12 weeks you&rsquo;d regain{" "}
          <span className={styles.totalNumber}>{totalHours}</span> hours to
          spend on&hellip;
        </p>
      )}
    </div>
  );
}
