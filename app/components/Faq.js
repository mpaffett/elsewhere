import Image from "next/image";
import styles from "./Faq.module.css";

// Answers pulled from what already exists elsewhere on the site (the old
// /about page, the offer card's small print, the locked REFUND decision in
// the elsewhere-mvp-scope-brainstorm memory) plus the practical questions
// raised in the "should we add nav" discussion on 2026-09-17 -- not
// invented filler, real anticipated questions.
const FAQS = [
  {
    question: "Who made this, and why?",
    photo: true,
    answer:
      "I'm Matt. I built Elsewhere because I needed it myself — I spend far more time on my phone than I'd like to admit, and I got tired of watching that time disappear into nothing. I don't love asking people for money, but keeping this going (and building the next thing after it) takes real time and cost, and I'd rather charge a small amount upfront than fill this with ads or sell your data. This isn't really about one plan or one week — I want to spend my time building things that pull people off their phones and into the real world. Elsewhere is the first step in that.",
  },
  {
    question: "What do I actually get for £9?",
    answer:
      "A personalised 7-day plan for whichever project you pick — drawing, journaling, or writing a poem. A day-by-day roadmap of exactly what to do, plus a printable tracker to tick off each day and reflect as you go. Made by hand and sent to your email within 24 hours.",
  },
  {
    question: "What happens if I miss a day?",
    answer:
      "Nothing dramatic — just pick back up the next day. This is meant to be a floor, not a streak to protect. Missing one day doesn't undo the rest of the week.",
  },
  {
    question: "Can I change my daily minutes after I've paid?",
    answer:
      "Yes — just get in touch and I'll adjust it. You're not locked into whatever you picked before paying.",
  },
  {
    question: "What if it's not right for me?",
    answer:
      "Just get in touch. There's no formal refund policy, but I handle it case by case rather than leaving you stuck.",
  },
  {
    question: "How is this different from a habit-tracking app?",
    answer:
      "Most apps ask you to track less phone use. Elsewhere doesn't touch your phone use at all — it gives you one small, specific thing to make instead, with a plan for exactly what to do each day. The proof isn't a lower screen-time number, it's a finished thing you can point to.",
  },
];

// The founder story used to live on its own /about page -- folded in here
// instead (2026-09-17) so the whole site stays one page, per Matt's call.
// The top-right corner hint ("Made by Matt") links straight to this
// section's first question rather than to a separate route.
export default function Faq() {
  return (
    <div className={styles.card} id="faq">
      <h2 className={styles.heading}>A few questions</h2>
      <div className={styles.list}>
        {FAQS.map((item) => (
          <div key={item.question} className={styles.item}>
            <p className={styles.question}>{item.question}</p>
            <div className={item.photo ? styles.answerRow : undefined}>
              {item.photo && (
                <Image
                  src="/matt.jpg"
                  alt="Matt, who built Elsewhere"
                  width={40}
                  height={40}
                  className={styles.photo}
                />
              )}
              <p className={styles.answer}>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
