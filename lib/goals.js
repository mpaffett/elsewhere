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
export const GOALS = [
  {
    id: "drawing",
    label: "Drawing",
    title: "The Daily Object",
    description:
      "Same object, same eyes, every day. The change from day one to day seven is impossible to unsee.",
  },
  {
    id: "journal",
    label: "Journaling",
    title: "The Seven Prompts",
    description:
      "A different prompt each day, a few honest minutes on the page. By day seven, you'll know yourself a little better than when you started.",
  },
  {
    id: "poem",
    label: "Poetry",
    title: "The Guided Poem",
    description:
      "A different poem to read each day, and a little writing of your own. By day seven, something exists that's entirely yours.",
  },
];
