// The three curated goals a visitor can choose from.
//
// Plain data, no React -- same pattern as calculate.js and validate.js.
// This replaced free-text goal input: see the "GOAL-LIST" section of the
// elsewhere-mvp-scope-brainstorm memory for why. Each goal will eventually
// get a real 7-day roadmap, written separately and delivered by email after
// payment -- that content doesn't live in this codebase at all.
//
// `label` is the small discipline tag shown above the card title
// ("Drawing", "Journaling", "Poetry") -- `title` is the more evocative name
// for the 7-day project itself, from the Google Stitch design pass. `id`
// stays unchanged, since it's what travels into the Stripe reference.
//
// Poem sits in the middle of this list on purpose -- it's the card that
// carries the "personal favourite" stamp (see GoalPicker.js), and Matt
// wanted it centred. Card *colour* stays tied to column position rather
// than to the goal itself though (see CARD_STYLE_BY_POSITION in
// GoalPicker.js) -- "keep yellow in the middle, purple on the right" --
// so only the content moved here, not which tint each slot gets.
export const GOALS = [
  {
    id: "drawing",
    label: "Drawing",
    title: "The Daily Object",
    description:
      "Pick one object and draw it every day for a week. Focus on a different element/techique each day.",
  },
  {
    id: "poem",
    label: "Poetry",
    title: "The Guided Poem",
    description:
      "Dip your toes into the world of poetry. Read one poem a day, a variety of styles, and finish the week with a poem that came from your own head.",
  },
  {
    id: "journal",
    label: "Journaling",
    title: "The Seven Prompts",
    description:
      "One journalling prompt per day, for seven days. Nothing strenous. Just taking time out for yourself to reflect. Know yourself a little better by the end of the week.",
  },
];
