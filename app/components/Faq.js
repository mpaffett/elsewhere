"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Faq.module.css";

// The five questions Matt drafted himself (2026-09-18) -- kept in his own
// words, just tightened for length and one unfinished sentence fixed.
const FAQS = [
  {
    question: "What is Elsewhere?",
    answer:
      "In short, Elsewhere is a 7-day mini challenge: you create something slowly, over the course of a week. Input your screen time, choose the project that appeals to you most (more to come soon!), decide how much time you can realistically commit each day, pay me ;), then follow the daily tasks. By the end of the week you'll have your own keepsake — and, hopefully, the itch to create more.",
  },
  {
    question: "Who made this, and why?",
    photo: true,
    answer:
      "Hi, I'm Matt. Tiny experiments have helped me reframe my relationship with screens and tech. The friction I felt at the thought of spending 15 minutes a day creating something, next to the ease with which I'd lose 3 hours to Instagram reels, was telling. So one day I made a deal with myself: draw a sunflower once a day for a week. What happened wasn't just that I got better at drawing — I'd dipped my toes into a long-time interest, and by the end of the week I had a drawing that admittedly was far from Picasso, but it was something that didn't exist before, and it existed because of me. That felt good. I signed it, framed it, put it on my desk — and that paved the way for dozens more tiny experiments.",
  },
  {
    question: "Why would I pay £9 for something I could just do for free?",
    answer:
      "You absolutely can (and should!) start a tiny experiment of your own, for free. You're under no obligation to spend £9 on this. If you've got the idea, feel free to steal it, make your own version, and go.",
  },
  {
    question: "Why do you charge £9 for this?",
    answer:
      "Eventually, I'd love to make a living from getting people away from their screens — whatever form that takes. This is my first step toward that much bigger goal, and the £9 is a bit of encouragement along the way.",
  },
  {
    question: "What do I actually get for £9?",
    answer:
      "A curated 7-day roadmap for the project of your choice, plus a printable tracker with space to reflect as you go. Delivered to your inbox within 24 hours.",
  },
];

// The founder story used to live on its own /about page -- folded in here
// instead (2026-09-17) so the whole site stays one page, per Matt's call.
// The top-right corner hint ("Made by Matt") links straight to this
// section's first question rather than to a separate route.
//
// Each question is a button that toggles its own answer open/closed --
// added 2026-09-18 so the section reads as a compact list of questions
// rather than a wall of text. The smooth reveal uses the CSS grid-rows
// trick (0fr -> 1fr) rather than JS height measurement or max-height.
export default function Faq() {
  const [openQuestion, setOpenQuestion] = useState(null);

  return (
    <div className={styles.card} id="faq">
      <h2 className={styles.heading}>FAQ</h2>
      <div className={styles.list}>
        {FAQS.map((item) => {
          const isOpen = openQuestion === item.question;
          return (
            <div key={item.question} className={styles.item}>
              <button
                type="button"
                className={styles.question}
                aria-expanded={isOpen}
                onClick={() => setOpenQuestion(isOpen ? null : item.question)}
              >
                <span>{item.question}</span>
                <span className={styles.chevron} aria-hidden="true" />
              </button>
              <div
                className={styles.answerWrap}
                data-open={isOpen || undefined}
              >
                <div className={styles.answerInner}>
                  <div className={styles.answerRow}>
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
