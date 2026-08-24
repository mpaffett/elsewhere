// All the input checking for Elsewhere lives here.
//
// Like calculate.js, this is plain JavaScript with no React in it.
//
// Every function here follows the same shape. It takes the raw text out of a
// form box and returns either:
//
//   { ok: true,  ...the cleaned-up value }
//   { ok: false, message: "something a human can read" }
//
// The component never has to work out what went wrong. It just shows the
// message it is handed.

import { MIN_DAILY_MINUTES, toMinutes } from "./calculate.js";

const MINUTES_IN_A_DAY = 24 * 60;

export const GOAL_MAX_LENGTH = 120;

// Turn one form box into a number.
//
// An empty box counts as zero, so someone who types 45 into minutes and
// leaves hours blank still gets a sensible answer. Anything that isn't a
// number comes back as NaN, which the caller checks for.
function toNumber(value) {
  const trimmed = String(value).trim();

  if (trimmed === "") {
    return 0;
  }

  return Number(trimmed);
}

// Check the two screen time boxes. The rules are in the order a person would
// hit them.
export function validateScreenTime(hoursInput, minutesInput) {
  const hoursIsBlank = String(hoursInput).trim() === "";
  const minutesIsBlank = String(minutesInput).trim() === "";

  if (hoursIsBlank && minutesIsBlank) {
    return {
      ok: false,
      message: "How much screen time do you have on an average day?",
    };
  }

  const hours = toNumber(hoursInput);
  const minutes = toNumber(minutesInput);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return { ok: false, message: "Pop a number in for us." };
  }

  if (hours < 0 || minutes < 0) {
    return { ok: false, message: "Screen time can't be negative." };
  }

  if (minutes >= 60) {
    return {
      ok: false,
      message: "Minutes should be under 60 — use the hours box instead.",
    };
  }

  const totalMinutes = toMinutes(hours, minutes);

  if (totalMinutes > MINUTES_IN_A_DAY) {
    return { ok: false, message: "There are only 24 hours in a day." };
  }

  if (totalMinutes < MIN_DAILY_MINUTES) {
    return {
      ok: false,
      message: "Under half an hour a day? You're already elsewhere.",
    };
  }

  return { ok: true, totalMinutes: totalMinutes };
}

// Check the goal box.
export function validateGoal(goalInput) {
  const goal = String(goalInput).trim();

  if (goal === "") {
    return {
      ok: false,
      message: "What would you love to make progress on? For example: learn Spanish.",
    };
  }

  if (goal.length > GOAL_MAX_LENGTH) {
    return {
      ok: false,
      message: `Keep it under ${GOAL_MAX_LENGTH} characters so it fits on the poster.`,
    };
  }

  return { ok: true, goal: goal };
}
