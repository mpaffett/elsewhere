import Image from "next/image";
import Link from "next/link";
import styles from "./FounderTeaser.module.css";

// A small, always-visible sign that a real person made this -- separate
// from the main flow entirely, so it never gates the first action and
// never sits near the payment ask. See the "founder placement" discussion
// in the elsewhere-mvp-scope-brainstorm memory for why it lives here and
// not in either of those spots.
//
// Styled as a card sitting beside the hero text, not a header line --
// the layout Calculator.js's caller (page.js) now gives it makes room for
// that without needing FounderTeaser itself to know about the hero.
//
// No "use client" needed -- this is static content plus a link, so it can
// stay a server component like page.js itself.
export default function FounderTeaser() {
  return (
    <div className={styles.card}>
      <Image
        src="/matt.jpg"
        alt="Matt, who built Elsewhere"
        width={40}
        height={40}
        className={styles.photo}
      />
      <div className={styles.copy}>
        <p className={styles.text}>
          Hi, I&rsquo;m Matt &mdash; I built this because I needed it myself.
        </p>
        <Link href="/about" className={styles.link}>
          My story &rarr;
        </Link>
      </div>
    </div>
  );
}
