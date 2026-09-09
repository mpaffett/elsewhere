import Link from "next/link";
import styles from "./page.module.css";

// A folder with a page.js is automatically a route in the App Router --
// this one answers /about. It inherits the root layout (app/layout.js)
// automatically, so it gets the same fonts and background as the main
// page for free, with nothing extra to set up here.
//
// Placeholder content throughout, clearly Matt's to rewrite -- drawn from
// his own words in the original scoping doc, where he described himself
// as the app's own target audience.
export default function About() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <span className={styles.photoPlaceholder} aria-hidden="true" />

        <p>
          Hi, I&rsquo;m Matt. I built Elsewhere because I needed it myself
          &mdash; I spend far more time on my phone than I&rsquo;d like to
          admit, and I got tired of watching that time disappear into
          nothing.
        </p>

        <p>
          This app started as a way to hold myself accountable: a small,
          honest nudge toward doing something with an hour I&rsquo;d
          otherwise lose to a screen. If it helps you the way I hoped it
          would help me, that&rsquo;s the whole point.
        </p>

        <p>
          I&rsquo;ll be honest &mdash; I don&rsquo;t love asking people for
          money. But keeping Elsewhere going, and building the next thing
          after it, takes real time and real cost, and I&rsquo;d rather
          charge a small amount upfront than fill this with ads or sell your
          data. The £9 goes straight toward that: building more ways to
          pull people away from their screens.
        </p>

        <p>
          Because this isn&rsquo;t really about one plan or one week.
          I want to spend my time building things that get people off their
          phones and back into the real world &mdash; drawing, writing,
          making, moving, whatever it is for you. Elsewhere is the first
          step in that, not the whole of it. Every plan someone buys helps
          me keep pushing that forward.
        </p>

        <p>Thanks for being here.</p>

        <Link href="/" className={styles.back}>
          &larr; Back to Elsewhere
        </Link>
      </div>
    </main>
  );
}
