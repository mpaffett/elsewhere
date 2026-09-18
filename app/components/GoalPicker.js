import Image from "next/image";
import { GOALS } from "../../lib/goals.js";
import { CheckIcon, NotebookIcon, PencilIcon, QuoteIcon } from "./Icons.js";
import styles from "./GoalPicker.module.css";

// Icon per goal, keyed by id -- kept here rather than in lib/goals.js so
// that plain-data file stays free of React components. See the
// "GOAL-LIST" section of the elsewhere-mvp-scope-brainstorm memory for
// why there are exactly three.
const ICON_BY_GOAL = {
  drawing: PencilIcon,
  journal: NotebookIcon,
  poem: QuoteIcon,
};

// Tint is keyed by column position, not by goal -- "keep yellow in the
// middle, purple on the right" even as poem (previously on the right,
// lavender) moved into the centre slot. Whichever goal ends up in a given
// column takes that column's colour.
const TINT_BY_POSITION = [styles.sage, styles.peach, styles.lavender];

// Three curated goals, click to choose. Replaces what used to be a free-text
// box -- see the "GOAL-LIST" section of the elsewhere-mvp-scope-brainstorm
// memory for why. A <button> per card rather than a clickable <div>, so
// clicking and keyboard use both work without any extra ARIA wiring.
//
// `className` is passed in from Calculator.js so this reuses the same grid
// layout the daily-ask cards use, rather than each component defining its
// own copy of the same three-column grid.
export default function GoalPicker({ selectedId, onSelect, className }) {
  return (
    <div>
      <p className={styles.heading}>
        If you could send some of that time{" "}
        <em className={styles.emphasis}>elsewhere</em>, where would you send
        it?
      </p>

      <div className={`${styles.picker} ${className || ""}`}>
        {GOALS.map((goal, index) => {
          const tint = TINT_BY_POSITION[index];
          const Icon = ICON_BY_GOAL[goal.id];
          const isSelected = goal.id === selectedId;

          return (
            <button
              key={goal.id}
              type="button"
              className={`${styles.card} ${tint} ${
                isSelected ? styles.selected : ""
              }`}
              onClick={() => onSelect(goal.id)}
            >
              {/* Matt's own generated stamp asset (public/favourite-stamp.png,
                  background keyed to transparent, ink recoloured to the
                  brand terracotta -- see
                  scratchpad/make_stamp_transparent.py), stamped over the
                  top-right corner at a slight angle rather than an arrow
                  and label. Replaces the earlier arrow/callout attempt. */}
              {goal.id === "poem" && (
                <Image
                  src="/favourite-stamp.png"
                  alt=""
                  aria-hidden="true"
                  width={300}
                  height={296}
                  className={styles.stamp}
                />
              )}

              <div className={styles.cardTop}>
                <span className={styles.iconTile}>
                  <Icon className={styles.icon} />
                </span>
                {isSelected && (
                  <span className={styles.badge}>
                    <CheckIcon className={styles.badgeIcon} />
                    Selected
                  </span>
                )}
              </div>
              <span className={styles.label}>{goal.label}</span>
              <span className={styles.title}>{goal.title}</span>
              <span className={styles.description}>{goal.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
