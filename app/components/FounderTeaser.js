import Image from "next/image";
import Link from "next/link";
import styles from "./FounderTeaser.module.css";

// A small, always-visible sign that a real person made this -- lives in
// the top-right corner (see page.js's wordmarkRow) so it never gates the
// first action and never sits near the payment ask. See the "founder
// placement" discussion in the elsewhere-mvp-scope-brainstorm memory for
// why it lives separately from both of those.
//
// Deliberately quiet -- small, muted, not bold -- since this corner spot
// is meant to catch the eye for a second without competing with the
// centred wordmark and headline. A louder, centred version (photo + wave
// emoji + a full sentence) was tried directly under the wordmark and felt
// too busy, stacked on top of the tag pill right below it (2026-09-17).
//
// No "use client" needed -- this is static content plus a link, so it can
// stay a server component like page.js itself.
export default function FounderTeaser() {
  return (
    <Link href="/about" className={styles.pill}>
      <Image
        src="/matt.jpg"
        alt="Matt, who built Elsewhere"
        width={24}
        height={24}
        className={styles.photo}
      />
      <span className={styles.text}>
        Hi, I&rsquo;m Matt &mdash; here&rsquo;s why &rarr;
      </span>
    </Link>
  );
}
