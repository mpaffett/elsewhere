// All the maths for Elsewhere lives here.
//
// Every function in this file is plain JavaScript: give it numbers, it gives
// numbers back. There is no React and no browser code, which means you can
// read it top to bottom without thinking about the interface at all.
//
// The whole file works in whole MINUTES and only converts to hours right at
// the end. Minutes are whole numbers, and whole numbers don't produce
// surprises like 0.30000000000000004.

// Six weeks. This is the horizon the entire app is built around, and it
// matches the six weekly milestones in the paid plan later on.
//
// It was twelve weeks. Twelve was too far away to feel real -- a date three
// months out reads as "someday" rather than something you're about to do.
// Six weeks lands close enough to picture while still being long enough for
// the totals to be worth something.
export const HORIZON_DAYS = 42;

// The three reductions we show, written as fractions of the user's screen time.
export const REDUCTIONS = [0.25, 0.5, 0.75];

// Below this, the numbers stop being interesting (and 25% of a tiny number
// rounds down to zero, which would read badly).
export const MIN_DAILY_MINUTES = 30;

// Turn the two form boxes into a single number of minutes.
// toMinutes(3, 30) is 210.
export function toMinutes(hours, minutes) {
  return Math.round(hours * 60 + minutes);
}

// How many minutes a day this reduction gives back.
// reclaimedPerDay(210, 0.25) is 53.
export function reclaimedPerDay(totalMinutes, reduction) {
  return Math.round(totalMinutes * reduction);
}

// Those daily minutes added up across the six weeks, as whole hours.
// reclaimedOverHorizon(53) is 37.
export function reclaimedOverHorizon(perDayMinutes) {
  const minutesOverHorizon = perDayMinutes * HORIZON_DAYS;
  return Math.round(minutesOverHorizon / 60);
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

// The date six weeks from today, written like "8 October".
//
// setDate() rolls over the ends of months and years correctly by itself, so
// there is no calendar arithmetic here to get wrong.
//
// The locale is pinned to en-GB on purpose. Left to itself this would follow
// each visitor's browser, which means the date you see while building is not
// the date everyone else sees.
//
// `from` is a parameter only so the tests can pass in a fixed date.
export function horizonEndDate(from = new Date()) {
  const end = new Date(from);
  end.setDate(end.getDate() + HORIZON_DAYS);
  return end.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

// The reduction written the way a person would say it out loud.
//
// "a quarter of your screen time" reads far more like a human than "25% of
// your screen time", and this sits as supporting text under the headline, so
// it wants to be conversational rather than precise.
//
// The percentage is kept as a fallback for anything outside the three
// reductions we actually show, so this can never render blank.
export function proportionLabel(percent) {
  if (percent === 25) {
    return "a quarter";
  }
  if (percent === 50) {
    return "half";
  }
  if (percent === 75) {
    return "three quarters";
  }
  return `${percent}%`;
}

// The one function the interface actually calls. Give it the user's total
// daily minutes and it returns everything the three cards need to display:
//
//   [
//     { percent: 25, perDayLabel: "53 minutes",         proportionLabel: "a quarter",      totalHours: 37, endDate: "8 October" },
//     { percent: 50, perDayLabel: "1 hour 45 minutes",  proportionLabel: "half",           totalHours: 74, endDate: "8 October" },
//     { percent: 75, perDayLabel: "2 hours 38 minutes", proportionLabel: "three quarters", totalHours: 111, endDate: "8 October" },
//   ]
//
// The date is the same on every card -- all three reductions run over the
// same six weeks, only the outcome changes. That's on purpose: seeing one
// finish line with three different outcomes is what makes redirecting more
// of your time feel worth it.
export function calculateAll(totalMinutes) {
  const endDate = horizonEndDate();

  return REDUCTIONS.map((reduction) => {
    const perDayMinutes = reclaimedPerDay(totalMinutes, reduction);
    const percent = Math.round(reduction * 100);

    return {
      percent: percent,
      perDayMinutes: perDayMinutes,
      perDayLabel: formatDuration(perDayMinutes),
      proportionLabel: proportionLabel(percent),
      totalHours: reclaimedOverHorizon(perDayMinutes),
      endDate: endDate,
    };
  });
}
