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
              slice of it somewhere better. No subscription, no app, no
              streaks.
            </p>
          </div>

          <FounderTeaser />
        </div>

        <Calculator />

        <div className={styles.quote}>
          <blockquote className={styles.quoteText}>
            &ldquo;It&rsquo;s not about making the best thing in the world.
            It&rsquo;s about making something that didn&rsquo;t exist
            before.&rdquo;
          </blockquote>
          <p className={styles.quoteAttribution}>
            &mdash; Matt, who built Elsewhere
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
