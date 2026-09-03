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
        Here&rsquo;s roughly what your screen time adds up to:
      </p>
      <div className={styles.rows}>
        {rows.map((row) => (
          <div key={row.horizon} className={styles.row}>
            <span className={styles.horizon}>{row.horizon}</span>
            {/* Grouped so the two can wrap together onto their own line on a
                narrow screen, rather than the horizon text itself getting
                squeezed and wrapping mid-phrase. */}
            <span className={styles.figure}>
              <span className={styles.label}>{row.duration}</span>
              {/* Below a full day, row.duration is already "N hours" --
                  formatLongDuration's own fallback for a total that's too
                  small to show as a day-count. Repeating the identical
                  number in the footnote ("4 hours" next to "4 hours") isn't
                  a second fact, so it's skipped in that case. */}
              {row.hours >= 24 && (
                <span className={styles.hours}>
                  {row.hours.toLocaleString("en-GB")} hours
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
