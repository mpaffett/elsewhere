import styles from "./CostTotals.module.css";

// Three rows, no state, no logic -- given the output of costOverLifetime,
// it just displays it. This is the cost section: the numbers that make the
// rest of the page worth asking about.
//
// It renders the instant the visitor presses the first button, because the
// maths behind it is free -- no AI call, just their own number multiplied
// out. That immediacy is the point: nobody argues with arithmetic on their
// own habit.
export default function CostTotals({ rows }) {
  return (
    <div className={styles.card}>
      <p className={styles.intro}>
        That&rsquo;s roughly what your screen time adds up to.
      </p>
      <div className={styles.rows}>
        {rows.map((row) => (
          <div key={row.years} className={styles.row}>
            <span className={styles.horizon}>
              In {row.years} year{row.years === 1 ? "" : "s"}
            </span>
            {/* Grouped so the two can wrap together onto their own line on a
                narrow screen, rather than the horizon text itself getting
                squeezed and wrapping mid-phrase. */}
            <span className={styles.figure}>
              <span className={styles.label}>{row.label}</span>
              <span className={styles.hours}>
                {row.hours.toLocaleString("en-GB")} hours
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
