// All the maths for Elsewhere lives here.
//
// Every function in this file is plain JavaScript: give it numbers, it gives
// numbers back. There is no React and no browser code, which means you can
// read it top to bottom without thinking about the interface at all.
//
// The whole file works in whole MINUTES and only converts to hours right at
// the end. Minutes are whole numbers, and whole numbers don't produce
// surprises like 0.30000000000000004.

// Below this, the numbers stop being interesting (and a small percentage of
// a tiny number rounds down to zero, which would read badly).
export const MIN_DAILY_MINUTES = 30;

// Turn the two form boxes into a single number of minutes.
// toMinutes(3, 30) is 210.
export function toMinutes(hours, minutes) {
  return Math.round(hours * 60 + minutes);
}

// Turn a number of minutes into words a person would actually say.
// 53 becomes "53 minutes". 105 becomes "1 hour 45 minutes". 120 becomes
// "2 hours" -- not "2 hours 0 minutes".
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }

  const hours = Math.floor(minutes / 60);
  const leftoverMinutes = minutes % 60;
  const hoursLabel = `${hours} ${hours === 1 ? "hour" : "hours"}`;

  if (leftoverMinutes === 0) {
    return hoursLabel;
  }

  const minutesLabel = `${leftoverMinutes} ${
    leftoverMinutes === 1 ? "minute" : "minutes"
  }`;
  return `${hoursLabel} ${minutesLabel}`;
}

// ---------------------------------------------------------------------
// The daily ask
//
// Once a visitor has picked one of the three curated goals, this is what
// asks them to commit a daily minimum toward it -- small on purpose, and
// still a genuine slice of their own reported screen time rather than a
// generic number the same for everyone. See the "DAILY-ASK" section of the
// elsewhere-mvp-scope-brainstorm memory for why 5/10/15% replaced the
// original 25/50/75% reduction tiers this file used to compute.
// ---------------------------------------------------------------------

// The three daily-minimum options, as fractions of the visitor's own
// screen time.
export const DAILY_ASK_PERCENTAGES = [0.05, 0.1, 0.15];

// One option per percentage: how many minutes that works out to (worded,
// via formatDuration above), and the percentage itself for the reassurance
// line under the headline number -- "that's 5% of what you're already
// spending".
//
// dailyAskOptions(240) is:
//   [
//     { percent: 5,  minutes: 12, minutesLabel: "12 minutes" },
//     { percent: 10, minutes: 24, minutesLabel: "24 minutes" },
//     { percent: 15, minutes: 36, minutesLabel: "36 minutes" },
//   ]
export function dailyAskOptions(totalMinutes) {
  return DAILY_ASK_PERCENTAGES.map((fraction) => {
    const minutes = Math.round(totalMinutes * fraction);

    return {
      percent: Math.round(fraction * 100),
      minutes: minutes,
      minutesLabel: formatDuration(minutes),
    };
  });
}

// ---------------------------------------------------------------------
// The lifetime cost
//
// Everything above answers "what could you gain". These three functions
// answer the question that motivates asking in the first place: "what is
// your current screen time actually costing you". They're shown first, as
// a set of big, undeniable numbers, before the app asks anything else.
// ---------------------------------------------------------------------

// A week is exactly 7 days -- no averaging needed, unlike a month or year.
const DAYS_PER_WEEK = 7;

// A year is treated as a flat 365 days. Leap days would move a year-long
// total by about 0.07%, which is far below the precision of someone's own
// guess at their daily screen time, and 365 is a number a reader can check
// in their head -- "days times minutes" -- without wondering why it doesn't
// quite match.
const DAYS_PER_YEAR = 365;

// One month, in days, using the same 365-day year as everything else in this
// section so every figure here stays consistent with every other.
const DAYS_PER_MONTH = DAYS_PER_YEAR / 12;

// The three horizons we show the cost over: this week, this month, this
// year. Nearer and more concrete than a multi-year span -- a week or a
// month is something a reader can actually picture happening to them,
// where "in 30 years" reads as abstract despite being the bigger number.
export const LIFETIME_HORIZONS = [
  { label: "This week", days: DAYS_PER_WEEK },
  { label: "This month", days: DAYS_PER_MONTH },
  { label: "This year", days: DAYS_PER_YEAR },
];

// How many whole hours a given daily total adds up to over N days.
// screenTimeOverDays(240, 7) is 28.
export function screenTimeOverDays(totalMinutes, days) {
  const totalMinutesOverDays = totalMinutes * days;
  return Math.round(totalMinutesOverDays / 60);
}

// Turn a number of hours into the largest unit that's still an honest
// picture of it -- hours while it's under a day, days while it's small,
// months once it's substantial, years once it's genuinely long. Unlike
// formatDuration, this never shows two units together: "5 years 3 months"
// reads as precise in a way these figures aren't, and one number is easier
// to feel.
//
// The day/month boundary is 90 days (three months), not 30 -- a year of
// screen time at an ordinary daily total lands around 60 days, and "61
// days" is the punchier, more literal number for that first horizon.
// "2 months" would undersell it. The month/year boundary is 2 years: a
// figure under that reads more naturally as a count of months.
export function formatLongDuration(hours) {
  // Below a full day, converting to a day-count would round a real, felt
  // number down to "0 days" -- someone at the 30-minute floor loses under a
  // day to a WEEK of screen time, and "0 days" reads like a bug, not a
  // fact. Hours are the honest unit until there's at least one whole day.
  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  const totalDays = hours / 24;

  if (totalDays < 90) {
    const days = Math.round(totalDays);
    return `${days} ${days === 1 ? "day" : "days"}`;
  }

  const totalYears = totalDays / DAYS_PER_YEAR;

  if (totalYears < 2) {
    const months = Math.round(totalDays / DAYS_PER_MONTH);
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  // One decimal place reads as a considered figure rather than a rounded
  // guess, but "5.0 years" still looks like a mistake, so a whole number
  // drops the ".0".
  const years = Math.round(totalYears * 10) / 10;
  const yearsLabel = Number.isInteger(years) ? years.toString() : years.toFixed(1);
  return `${yearsLabel} ${years === 1 ? "year" : "years"}`;
}

// The one function the interface calls for the cost section. Give it the
// user's total daily minutes and it returns one row per horizon:
//
//   [
//     { horizon: "This week",  hours: 28,   duration: "1 day" },
//     { horizon: "This month", hours: 122,  duration: "5 days" },
//     { horizon: "This year",  hours: 1460, duration: "61 days" },
//   ]
export function costOverLifetime(totalMinutes) {
  return LIFETIME_HORIZONS.map((horizon) => {
    const hours = screenTimeOverDays(totalMinutes, horizon.days);

    return {
      horizon: horizon.label,
      hours: hours,
      duration: formatLongDuration(hours),
    };
  });
}
