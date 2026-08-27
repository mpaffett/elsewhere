import Calculator from "./components/Calculator.js";
import styles from "./page.module.css";

// This stays a server component -- only Calculator.js needs "use client".
// That means this heading, intro text, and footer are sent to the browser
// as plain HTML, with no JavaScript required to show them.
export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Elsewhere</h1>
        <p className={styles.intro}>
          See how far you could get toward something that matters, just by
          sending a slice of your screen time somewhere else.
        </p>
      </header>

      <Calculator />

      <footer className={styles.footer}>
        <p>Elsewhere</p>
      </footer>
    </main>
  );
}
