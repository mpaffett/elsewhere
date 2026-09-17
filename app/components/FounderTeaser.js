import Image from "next/image";
import Link from "next/link";
import styles from "./FounderTeaser.module.css";

// A small, always-visible sign that a real person made this -- lives
// centred in the top bar (see page.js's wordmarkRow) so it never gates the
// first action and never sits near the payment ask. See the "founder
// placement" discussion in the elsewhere-mvp-scope-brainstorm memory for
// why it lives separately from both of those.
//
// Slim pill, not a card -- the top bar only has room for a glance, not the
// fuller "Hi, I'm Matt..." line it used to carry when it sat beside the
// hero text.
//
// The wave is the real emoji rather than a custom icon -- a hand-drawn SVG
// version was tried first and didn't read clearly as a hand at this size,
// so the emoji won out.
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
      <span className={styles.wave} aria-hidden="true">
        &#128075;&#127996;
      </span>
      <span className={styles.text}>
        Hi! I&rsquo;m Matt. Here&rsquo;s why I built this &rarr;
      </span>
    </Link>
  );
}
