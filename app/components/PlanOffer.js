import { GOALS } from "../../lib/goals.js";
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
      <p className={styles.heading}>Ready to commit?</p>
      <p className={styles.pitch}>
        A day-by-day plan for {goal.title.toLowerCase()}, sized to{" "}
        {dailyAsk.minutesLabel} a day &mdash; sent straight to you.
      </p>
      <a href={href} className={styles.cta}>
        Get my plan &mdash; £9
      </a>
      {/* "Just get in touch" rather than a named address -- there's no
          public contact email defined anywhere in the app yet. Turn this
          into a mailto link once that's decided. Matches the locked REFUND
          decision: soft and personal, no formal policy.

          The 24-hour line sets expectations for manual, made-to-order
          fulfilment (see PAYMENT-FLOW in the elsewhere-mvp-scope-brainstorm
          memory) -- nothing here is sent automatically. */}
      <p className={styles.reassurance}>
        Plans are made by hand &mdash; please allow up to 24 hours for
        delivery. If it&rsquo;s not right for you, just get in touch.
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
    </div>
  );
}
