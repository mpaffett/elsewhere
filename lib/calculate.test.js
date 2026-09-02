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
  HORIZON_DAYS,
  LIFETIME_YEARS,
  calculateAll,
  costOverLifetime,
  formatDuration,
  formatLongDuration,
  horizonEndDate,
  proportionLabel,
  reclaimedOverHorizon,
  reclaimedPerDay,
  screenTimeOverYears,
  toMinutes,
} from "./calculate.js";

test("toMinutes turns hours and minutes into one number", () => {
  assert.equal(toMinutes(3, 30), 210);
  assert.equal(toMinutes(0, 45), 45);
  assert.equal(toMinutes(4, 0), 240);
});

test("reclaimedPerDay takes the right slice of the day", () => {
  assert.equal(reclaimedPerDay(240, 0.25), 60);
  assert.equal(reclaimedPerDay(240, 0.5), 120);
  assert.equal(reclaimedPerDay(240, 0.75), 180);
});

test("reclaimedPerDay rounds to whole minutes", () => {
  // 210 * 0.25 is 52.5
  assert.equal(reclaimedPerDay(210, 0.25), 53);
});

test("reclaimedOverHorizon adds the daily minutes up across six weeks", () => {
  // 60 minutes a day for 42 days is 2520 minutes, which is 42 hours.
  assert.equal(reclaimedOverHorizon(60), 42);
  // 45 minutes a day for 42 days is 1890 minutes, which is 31.5 -> 32 hours.
  assert.equal(reclaimedOverHorizon(45), 32);
});

test("the horizon is six weeks", () => {
  assert.equal(HORIZON_DAYS, 6 * 7);
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

test("horizonEndDate lands six weeks later", () => {
  // 22 August 2026 plus 42 days is 3 October 2026.
  const start = new Date("2026-08-22T12:00:00Z");
  assert.equal(horizonEndDate(start), "3 October");
});

test("horizonEndDate rolls over the end of a year", () => {
  // 1 December 2026 plus 42 days is 12 January 2027.
  const start = new Date("2026-12-01T12:00:00Z");
  assert.equal(horizonEndDate(start), "12 January");
});

test("proportionLabel says the fraction the way a person would", () => {
  assert.equal(proportionLabel(25), "a quarter");
  assert.equal(proportionLabel(50), "half");
  assert.equal(proportionLabel(75), "three quarters");
});

test("proportionLabel falls back to the percentage for anything else", () => {
  // Can't happen with the three reductions we ship, but this makes sure the
  // card can never render a blank where the proportion should be.
  assert.equal(proportionLabel(40), "40%");
});

test("calculateAll returns the three cards, ready to display", () => {
  const cards = calculateAll(240);

  assert.equal(cards.length, 3);

  // The date isn't asserted here -- it depends on today -- but it must be
  // the same string on every card. All three reductions share one horizon.
  const endDate = cards[0].endDate;
  assert.equal(typeof endDate, "string");
  assert.ok(endDate.length > 0);

  assert.deepEqual(cards[0], {
    percent: 25,
    perDayMinutes: 60,
    perDayLabel: "1 hour",
    proportionLabel: "a quarter",
    totalHours: 42,
    endDate: endDate,
  });

  assert.deepEqual(cards[1], {
    percent: 50,
    perDayMinutes: 120,
    perDayLabel: "2 hours",
    proportionLabel: "half",
    totalHours: 84,
    endDate: endDate,
  });

  assert.deepEqual(cards[2], {
    percent: 75,
    perDayMinutes: 180,
    perDayLabel: "3 hours",
    proportionLabel: "three quarters",
    totalHours: 126,
    endDate: endDate,
  });
});

test("the smallest screen time we accept still gives a real number", () => {
  // 30 minutes a day is the minimum, so the 25% card must not read
  // "0 minutes".
  const cards = calculateAll(30);
  assert.equal(cards[0].perDayLabel, "8 minutes");
  assert.ok(cards[0].totalHours > 0);
});

test("LIFETIME_YEARS is 1, 5 and 30", () => {
  assert.deepEqual(LIFETIME_YEARS, [1, 5, 30]);
});

test("screenTimeOverYears adds a daily total up across whole years", () => {
  // 240 minutes a day for 1 year is 87,600 minutes, which is 1,460 hours.
  assert.equal(screenTimeOverYears(240, 1), 1460);
  // The same daily total over 30 years is thirty times that.
  assert.equal(screenTimeOverYears(240, 30), 43800);
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
    { years: 1, hours: 1460, label: "61 days" },
    { years: 5, hours: 7300, label: "10 months" },
    { years: 30, hours: 43800, label: "5 years" },
  ]);
});

test("costOverLifetime still works right at the MIN_DAILY_MINUTES floor", () => {
  const rows = costOverLifetime(30);
  // 30 minutes a day for 1 year is 10,950 minutes, which is 182.5 -> 183
  // hours -- rounding happens in screenTimeOverYears, so this also checks
  // that costOverLifetime doesn't round a second time on top of it.
  assert.equal(rows[0].hours, 183);
});
