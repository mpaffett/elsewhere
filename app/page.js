import Calculator from "./components/Calculator.js";
import FounderTeaser from "./components/FounderTeaser.js";
import styles from "./page.module.css";

// This stays a server component -- only Calculator.js needs "use client".
// That means this heading, intro text, quote and footer are sent to the
// browser as plain HTML, with no JavaScript required to show them.
export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.wordmarkRow}>
        <span className={styles.wordmark}>Elsewhere</span>
      </div>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.tag}>
              <span className={styles.tagDot} aria-hidden="true" />A 7-day
              creative experiment
            </span>
            <h1 className={styles.title}>
              Turn wasted phone time into{" "}
              <em className={styles.emphasis}>one finished thing</em>.
            </h1>
            <p className={styles.intro}>
              See what your screen time really adds up to, then send a small
              slice of it somewhere better. No subscription, no app, no streaks.
            </p>
          </div>

          <FounderTeaser />
        </div>

        <Calculator />

        {/* The one-week commitment section -- makes explicit that this is
            a single week, a promise to yourself rather than a competition,
            and what sticking with it tends to produce. Matt's own words
            (2026-09-16), tightened for the page. Sits between the
            calculator and the ethos section below: this one concrete and
            practical, that one more philosophical. */}
        <div className={styles.commitment}>
          <p className={styles.commitmentIntro}>
            This isn&rsquo;t a competition. It&rsquo;s a commitment you make to
            yourself, for one week. Stick with it, and by day seven you&rsquo;ll
            have:
          </p>
          <ol className={styles.commitmentList}>
            <li>Something that didn&rsquo;t exist when the week began.</li>
            <li>
              A clearer sense of where your time and attention actually go.
            </li>
            <li>A new hobby you might enjoy.</li>
            <li>A bit more clarity in how you think and speak.</li>
            <li>
              Proof (through experience) that you can send your time wherever
              you choose.
            </li>
          </ol>
        </div>

        {/* The ethos section -- why Elsewhere exists, in Matt's own words
            (2026-09-16), replacing the earlier placeholder quote. Kept
            deliberately separate from the offer card: what someone gets
            for £9 and why Matt charges for it each live at the point of
            the ask instead, not mixed in here. */}
        <div className={styles.quote}>
          <p className={styles.quoteText}>
            Elsewhere exists to attempt to show what is possible if you send a
            small slice of your time toward creation rather than consumption.
          </p>
          <p className={styles.quoteText}>
            To hold something in your hands that did not exist at the beginning
            of the week, all because of a conscious decision and commitment to
            build rather than consume was a lightbulb moment for me personally,
            and an experience I wish as many of you to have also.
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerBrand}>Elsewhere</span>
        <p className={styles.footerNote}>Made by Matt.</p>
        <div className={styles.footerLinks}>
          <a href="/about">My story</a>
          <a href="mailto:hello@elsewhere.it.com">Contact</a>
        </div>
      </footer>
    </div>
  );
}
