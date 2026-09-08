// Tests for the maths.
//
// These use Node's own built-in test runner, so there is nothing to install.
// Run them with:
//
//   npm test
//
// Each test says what it expects in plain English. If you change a number in
// calculate.js and a test goes red, the failure message tells you exactly
// which sum disagrees.

import test from "node:test";
import assert from "node:assert/strict";

import {
  DAILY_ASK_PERCENTAGES,
  LIFETIME_HORIZONS,
  MIN_DAILY_MINUTES,
  costOverLifetime,
  dailyAskOptions,
  formatDuration,
  formatLongDuration,
  screenTimeOverDays,
  toMinutes,
} from "./calculate.js";

test("toMinutes turns hours and minutes into one number", () => {
  assert.equal(toMinutes(3, 30), 210);
  assert.equal(toMinutes(0, 45), 45);
  assert.equal(toMinutes(4, 0), 240);
});

test("DAILY_ASK_PERCENTAGES is 5%, 10% and 15%", () => {
  assert.deepEqual(DAILY_ASK_PERCENTAGES, [0.05, 0.1, 0.15]);
});

test("dailyAskOptions returns one option per percentage, worked by hand", () => {
  // 240 minutes a day: 5% is 12, 10% is 24, 15% is 36.
  assert.deepEqual(dailyAskOptions(240), [
    { percent: 5, minutes: 12, minutesLabel: "12 minutes" },
    { percent: 10, minutes: 24, minutesLabel: "24 minutes" },
    { percent: 15, minutes: 36, minutesLabel: "36 minutes" },
  ]);
});

test("dailyAskOptions never rounds down to zero at the screen-time floor", () => {
  // 30 minutes a day (MIN_DAILY_MINUTES): 5% of 30 is 1.5 -> 2, not 0.
  const options = dailyAskOptions(MIN_DAILY_MINUTES);
  assert.equal(options[0].minutes, 2);
  assert.ok(options.every((option) => option.minutes > 0));
});

test("formatDuration writes minutes the way a person would say them", () => {
  assert.equal(formatDuration(1), "1 minute");
  assert.equal(formatDuration(53), "53 minutes");
});

test("formatDuration writes hours and minutes together", () => {
  assert.equal(formatDuration(105), "1 hour 45 minutes");
  assert.equal(formatDuration(158), "2 hours 38 minutes");
  assert.equal(formatDuration(61), "1 hour 1 minute");
});

test("formatDuration leaves off the minutes when there are none", () => {
  assert.equal(formatDuration(60), "1 hour");
  assert.equal(formatDuration(120), "2 hours");
});

test("LIFETIME_HORIZONS is this week, this month, this year", () => {
  assert.deepEqual(
    LIFETIME_HORIZONS.map((horizon) => horizon.label),
    ["This week", "This month", "This year"],
  );
  assert.equal(LIFETIME_HORIZONS[0].days, 7);
  assert.equal(LIFETIME_HORIZONS[2].days, 365);
});

test("screenTimeOverDays adds a daily total up across a number of days", () => {
  // 240 minutes a day for a week (7 days) is 1,680 minutes, 28 hours.
  assert.equal(screenTimeOverDays(240, 7), 28);
  // The same daily total over a year (365 days) is 87,600 minutes, 1,460 hours.
  assert.equal(screenTimeOverDays(240, 365), 1460);
});

test("formatLongDuration shows hours below a full day", () => {
  assert.equal(formatLongDuration(1), "1 hour");
  assert.equal(formatLongDuration(4), "4 hours");
  assert.equal(formatLongDuration(23), "23 hours");
});

test("formatLongDuration shows days below the three-month mark", () => {
  assert.equal(formatLongDuration(24), "1 day");
  assert.equal(formatLongDuration(24 * 89), "89 days");
});

test("formatLongDuration switches to months at the three-month mark", () => {
  assert.equal(formatLongDuration(24 * 90), "3 months");
  // A year of screen time at an ordinary daily total: 1,460 hours is 60.83
  // days, which is still well under 90 -- this is the case the boundary
  // was chosen around, so it's worth a test of its own.
  assert.equal(formatLongDuration(1460), "61 days");
});

test("formatLongDuration switches to years at the two-year mark", () => {
  assert.equal(formatLongDuration(24 * 729), "24 months");
  assert.equal(formatLongDuration(24 * 730), "2 years");
});

test("formatLongDuration drops a trailing .0 but keeps a real decimal", () => {
  // 43,800 hours is exactly 5 years at 365 days/year.
  assert.equal(formatLongDuration(43800), "5 years");
  // 43,800 * 1.1 hours is 5.5 years.
  assert.equal(formatLongDuration(48180), "5.5 years");
});

test("costOverLifetime returns one row per horizon, worked by hand", () => {
  const rows = costOverLifetime(240);

  assert.deepEqual(rows, [
    { horizon: "This week", hours: 28, duration: "1 day" },
    { horizon: "This month", hours: 122, duration: "5 days" },
    { horizon: "This year", hours: 1460, duration: "61 days" },
  ]);
});

test("costOverLifetime still works right at the MIN_DAILY_MINUTES floor", () => {
  const rows = costOverLifetime(30);
  // 30 minutes a day for a week is 210 minutes, which is 3.5 -> 4 hours --
  // rounding happens in screenTimeOverDays, so this also checks that
  // costOverLifetime doesn't round a second time on top of it. And because
  // that's under a full day, it must read "4 hours", not "0 days".
  assert.equal(rows[0].hours, 4);
  assert.equal(rows[0].duration, "4 hours");
});
