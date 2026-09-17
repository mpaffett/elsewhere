import styles from "./Highlight.module.css";

// Wraps a word or short phrase in a hand-drawn-looking highlighter swipe --
// an irregular, slightly rotated blob behind the text rather than a clean
// rectangle, so it reads as marked by hand rather than a generic <mark>.
// The SVG fills the wrapper exactly (viewBox stretches with
// preserveAspectRatio="none"), then gets scaled up and rotated in CSS to
// overshoot the text on every side, the way a real highlighter stroke
// rarely lines up perfectly with the word underneath it.
export default function Highlight({ children }) {
  return (
    <span className={styles.wrap}>
      <svg
        className={styles.mark}
        viewBox="0 0 100 34"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M3,11 C18,4 34,15 52,9 C70,3 86,12 97,7 C98,13 97,20 96,26 C80,32 58,23 40,29 C24,34 9,27 3,23 Z" />
      </svg>
      <span className={styles.text}>{children}</span>
    </span>
  );
}
