import Link from "next/link";
import styles from "./FounderTeaser.module.css";

// A small, always-visible sign that a real person made this -- separate
// from the main flow entirely, so it never gates the first action and
// never sits near the payment ask. See the "founder placement" discussion
// in the elsewhere-mvp-scope-brainstorm memory for why it lives here and
// not in either of those spots.
//
// No "use client" needed -- this is static content plus a link, so it can
// stay a server component like page.js itself.
export default function FounderTeaser() {
  return (
    <div className={styles.teaser}>
      {/* Placeholder for a real photo later -- circular on purpose, so it
          reads as "a person" at a glance, distinct from the square icon
          placeholders on the goal cards. */}
      <span className={styles.photoPlaceholder} aria-hidden="true" />
      <p className={styles.text}>
        Hi, I&rsquo;m Matt &mdash; I built this because I needed it myself.{" "}
        <Link href="/about" className={styles.link}>
          My story &rarr;
        </Link>
      </p>
    </div>
  );
}
