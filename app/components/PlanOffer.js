import { GOALS } from "../../lib/goals.js";
import { ArrowIcon, CheckIcon } from "./Icons.js";
import styles from "./PlanOffer.module.css";

// The real £9, one-time Payment Link, created in Matt's Stripe dashboard.
const STRIPE_PAYMENT_LINK_URL = "https://buy.stripe.com/4gMbJ31MA1wt9lR3Ai2oE00";

// The real offer, replacing what used to be a placeholder email form. See
// the "PAYMENT-FLOW" section of the elsewhere-mvp-scope-brainstorm memory:
// a Stripe Payment Link, no custom checkout code, fulfilled by hand for v1.
export default function PlanOffer({ goalId, dailyAsk }) {
  const goal = GOALS.find((candidate) => candidate.id === goalId);

  // Travels with the payment into Stripe's dashboard, so whoever fulfils
  // the order (Matt, by hand, for now) knows what to send without having
  // to ask. Useful whether fulfilment stays manual or gets automated later.
  const reference = `${goalId}-${dailyAsk.minutes}min`;
  const href = `${STRIPE_PAYMENT_LINK_URL}?client_reference_id=${encodeURIComponent(reference)}`;

  return (
    <div className={styles.card}>
      {/* Spells out the actual commitment in plain terms -- Matt's own
          framing (2026-09-16): a visitor should know exactly what they're
          agreeing to before they click, not just see a plan name. */}
      <p className={styles.commitment}>
        <CheckIcon className={styles.commitmentIcon} />
        By clicking purchase, you&rsquo;re committing to{" "}
        <strong>{dailyAsk.minutesLabel}</strong> toward{" "}
        <strong>{goal.title}</strong> &mdash; every day, for 7 days.
      </p>

      {/* What £9 actually buys -- itemised, not just implied by "a plan".
          The tracker described here is the printable one-pager designed in
          the elsewhere-plan-pdf-design memory (poem's is finished; drawing
          and journaling are written once a real order needs them, since
          fulfilment is make-to-order). */}
      <div className={styles.included}>
        <p className={styles.includedHeading}>For £9, you&rsquo;ll get:</p>
        <ul className={styles.includedList}>
          <li>
            A 7-day roadmap &mdash; exactly what to do, each day, for the
            week.
          </li>
          <li>
            A printable tracker &mdash; stick it up, tick off each day, with
            space to reflect as you go.
          </li>
        </ul>
      </div>

      <a href={href} className={styles.cta}>
        Get my plan &mdash; £9
        <ArrowIcon className={styles.ctaIcon} />
      </a>

      {/* hello@elsewhere.it.com forwards to Matt's personal inbox (set up
          2026-09-14) -- masks his personal address without needing a real
          hosted mailbox yet. Matches the locked REFUND decision: soft and
          personal, no formal policy.

          The 24-hour line sets expectations for manual, made-to-order
          fulfilment (see PAYMENT-FLOW in the elsewhere-mvp-scope-brainstorm
          memory) -- nothing here is sent automatically. */}
      <p className={styles.reassurance}>
        Plans are made by hand &mdash; please allow up to 24 hours for
        delivery. If it&rsquo;s not right for you, just{" "}
        <a href="mailto:hello@elsewhere.it.com">get in touch</a>.
      </p>
      {/* PRIVACY, locked in the elsewhere-mvp-scope-brainstorm memory: a
          short line covering what the email is used for and that it's never
          sold/shared. Placed here rather than a separate policy page,
          because this is the actual moment the email gets collected
          (via Stripe checkout). */}
      <p className={styles.reassurance}>
        Your email is only ever used to send your plan &mdash; never sold or
        shared.
      </p>

      {/* Matt's own closing note (2026-09-16) -- kept light on purpose,
          separate from the practical reassurance lines above. */}
      <p className={styles.closingNote}>
        And beyond the plan itself &mdash; you&rsquo;d be helping a humble
        bloke (me) get a little closer to actually making a living teaching
        screen etiquette, to adults and kids alike. A dream, made a little
        more real, for £9. :)
      </p>
    </div>
  );
}
