import Calculator from "./components/Calculator.js";
import Faq from "./components/Faq.js";
import Highlight from "./components/Highlight.js";
import styles from "./page.module.css";

// This stays a server component -- only Calculator.js needs "use client".
// That means this heading, intro text, quote and footer are sent to the
// browser as plain HTML, with no JavaScript required to show them.
export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.wordmarkRow}>
        <span className={styles.wordmark}>
          <Highlight>Elsewhere</Highlight>
        </span>
      </div>

      <main className={styles.main}>
        <div className={styles.hero}>
          <span className={styles.tag}>
            <span className={styles.tagDot} aria-hidden="true" />A 7-day
            creative experiment
          </span>
          <h1 className={styles.title}>
            Send a small slice of your screen time{" "}
            <em className={styles.emphasis}>elsewhere</em> for 7 days.
          </h1>
          <p className={styles.intro}>
            One (small) project. One week. One tangible{" "}
            <Highlight>thing</Highlight> at the end of it.
          </p>
        </div>

        <Calculator />

        {/* Plainly spells out the mechanism (input screen time, pick a
            project, follow the plan), in Matt's own words (2026-09-18).
            Deliberately below the calculator rather than above it -- a
            first-time visitor shouldn't be hit with a wall of text before
            they've even reached step 1, but it's here for anyone curious
            enough to keep scrolling. Plain text, not a bordered card, so
            it stays light between two heavier sections. */}
        <p className={styles.explainer}>
          If you&rsquo;re anything like me, you spend more of your life staring
          at a screen than you&rsquo;d like to admit. Elsewhere is a first step
          toward reframing that: tell it your screen time, pick a project, and
          follow a simple plan for a week. By the end, you&rsquo;ll have made
          something real &mdash; and a small win you can point to.
        </p>

        {/* The one-week commitment section -- makes explicit that this is
            a single week, a promise to yourself rather than a competition,
            and what sticking with it tends to produce. Matt's own words
            (2026-09-16), tightened for the page. Sits between the
            calculator and the ethos section below: this one concrete and
            practical, that one more philosophical. */}
        <div className={styles.commitment}>
          <p className={styles.commitmentIntro}>
            The idea is not to become the next great artist or writer. The idea
            is just to create something. Stick with it, and by day seven
            you&rsquo;ll have:
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

        <Faq />
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerBrand}>Elsewhere</span>
        <p className={styles.footerNote}>Made by Matt.</p>
        <div className={styles.footerLinks}>
          <a href="#faq">FAQ</a>
          <a href="mailto:hello@elsewhere.it.com">Contact</a>
        </div>
      </footer>
    </div>
  );
}
