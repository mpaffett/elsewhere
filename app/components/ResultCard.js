import styles from "./ResultCard.module.css";

// A single result card. No state, no logic -- it just displays the values
// it's handed. All the maths already happened in lib/calculate.js.
//
// The card is a two-rung ladder. The top rung is something they could do in
// the next few hours; the bottom rung is where that lands them six weeks
// out. Showing only the far end made the payoff feel theoretical -- the
// whole point of the near rung is that the goal starts tonight, not someday.
export default function ResultCard({
  percent,
  perDayLabel,
  proportionLabel,
  totalHours,
  endDate,
  delayIndex,
  step,
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

      {/* Both rungs open with an emphasised time anchor -- "Tonight" and the
          date get matching treatment, so the ladder reads as two points on
          one line rather than two unrelated sentences. Everything after each
          lead-in is the AI's, including its own full stop. */}
      {step && (
        <>
          <p className={`${styles.sentence} ${styles.tonight}`}>
            <span className={styles.anchor}>Tonight</span> &mdash;{" "}
            {step.tonight}
          </p>
          <p className={styles.sentence}>
            By <span className={styles.anchor}>{endDate}</span>, {step.byThen}
          </p>
        </>
      )}

      {/* While waiting on the AI, both lead-ins still show -- they're
          already known -- with quiet placeholders standing in for the parts
          that aren't. Keeping both lines here means the card doesn't jump
          in height when the real text lands. */}
      {pending && !step && (
        <>
          <p
            className={`${styles.sentence} ${styles.tonight} ${styles.sentencePending}`}
          >
            <span className={styles.anchor}>Tonight</span> &mdash;&hellip;
          </p>
          <p className={`${styles.sentence} ${styles.sentencePending}`}>
            By <span className={styles.anchor}>{endDate}</span>&hellip;
          </p>
        </>
      )}

      {/* The hours, kept as quiet supporting text rather than the headline
          figure -- present for anyone who wants the receipt, easy to skip
          past for anyone who doesn't. */}
      {step && (
        <p className={styles.hoursFootnote}>{totalHours} hours elsewhere</p>
      )}
    </div>
  );
}
