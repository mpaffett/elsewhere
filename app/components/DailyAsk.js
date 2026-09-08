import { dailyAskOptions } from "../../lib/calculate.js";
import styles from "./DailyAsk.module.css";

// The one pledge moment in the whole flow: pick a daily minimum, framed as
// a floor rather than a fixed amount. See the "DAILY-ASK" section of the
// elsewhere-mvp-scope-brainstorm memory for why this replaced the old
// 25/50/75%-of-screen-time cards.
//
// `totalMinutes` is the visitor's own screen time, so the three options are
// still a genuine slice of what they actually spend, not a generic number
// the same for everyone.
export default function DailyAsk({
  totalMinutes,
  selectedPercent,
  onSelect,
  className,
}) {
  const options = dailyAskOptions(totalMinutes);

  return (
    <div>
      <p className={styles.heading}>How much can you commit each day?</p>
      <p className={styles.subline}>
        Pick the smallest amount you&rsquo;re confident you can do, every day,
        for one week. Go bigger if you want &mdash; this is your floor, not
        your ceiling.
      </p>

      <div className={`${styles.picker} ${className || ""}`}>
        {options.map((option) => (
          <button
            key={option.percent}
            type="button"
            className={`${styles.card} ${
              option.percent === selectedPercent ? styles.selected : ""
            }`}
            onClick={() => onSelect(option)}
          >
            <span className={styles.minutes}>
              {option.minutesLabel} a day
            </span>
            <span className={styles.reassurance}>
              that&rsquo;s {option.percent}% of your screen time
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
