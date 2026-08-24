import styles from "./ResultCard.module.css";

// A single result card. No state, no logic -- it just displays the three
// values it's handed. All the maths already happened in lib/calculate.js.
export default function ResultCard({ percent, perDayLabel, totalHours, delayIndex }) {
  return (
    <div
      className={`${styles.card} ${styles[`card${percent}`]}`}
      style={{ animationDelay: `${delayIndex * 90}ms` }}
    >
      <p className={styles.percent}>Give up {percent}%</p>
      <p className={styles.perDay}>{perDayLabel} a day</p>
      <p className={styles.total}>
        <span className={styles.totalNumber}>{totalHours}</span> hours back
        over 12 weeks
      </p>
    </div>
  );
}
