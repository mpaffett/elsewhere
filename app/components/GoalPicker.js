import { GOALS } from "../../lib/goals.js";
import { CheckIcon, NotebookIcon, PencilIcon, QuoteIcon } from "./Icons.js";
import styles from "./GoalPicker.module.css";

// One pastel "notebook cover" tint and icon per goal, keyed by id -- kept
// here rather than in lib/goals.js so that plain-data file stays free of
// React components. See the "GOAL-LIST" section of the
// elsewhere-mvp-scope-brainstorm memory for why there are exactly three.
const CARD_STYLE = {
  drawing: { tint: styles.sage, Icon: PencilIcon },
  journal: { tint: styles.peach, Icon: NotebookIcon },
  poem: { tint: styles.lavender, Icon: QuoteIcon },
};

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
        If you could send some of that time elsewhere, where would you send
        it?
      </p>

      <div className={`${styles.picker} ${className || ""}`}>
        {GOALS.map((goal) => {
          const { tint, Icon } = CARD_STYLE[goal.id];
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
