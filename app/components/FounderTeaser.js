import Image from "next/image";
import Link from "next/link";
import styles from "./FounderTeaser.module.css";

// A small, always-visible sign that a real person made this -- lives in
// the top bar (see page.js's wordmarkRow) so it never gates the first
// action and never sits near the payment ask. See the "founder placement"
// discussion in the elsewhere-mvp-scope-brainstorm memory for why it lives
// separately from both of those.
//
// Slim pill, not a card -- the top bar only has room for a glance, not the
// fuller "Hi, I'm Matt..." line it used to carry when it sat beside the
// hero text.
//
// No "use client" needed -- this is static content plus a link, so it can
// stay a server component like page.js itself.
export default function FounderTeaser() {
  return (
    <Link href="/about" className={styles.pill}>
      <Image
        src="/matt.jpg"
        alt="Matt, who built Elsewhere"
        width={28}
        height={28}
        className={styles.photo}
      />
      <span className={styles.text}>My story &rarr;</span>
    </Link>
  );
}
