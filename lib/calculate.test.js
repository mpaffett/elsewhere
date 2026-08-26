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
  calculateAll,
  formatDuration,
  reclaimedOverHorizon,
  reclaimedPerDay,
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

test("reclaimedOverHorizon adds the daily minutes up across twelve weeks", () => {
  // 60 minutes a day for 84 days is 5040 minutes, which is 84 hours.
  assert.equal(reclaimedOverHorizon(60), 84);
  // 45 minutes a day for 84 days is 3780 minutes, which is 63 hours.
  assert.equal(reclaimedOverHorizon(45), 63);
});

test("the horizon is twelve weeks", () => {
  assert.equal(HORIZON_DAYS, 12 * 7);
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

test("calculateAll returns the three cards, ready to display", () => {
  const cards = calculateAll(240);

  assert.equal(cards.length, 3);

  assert.deepEqual(cards[0], {
    percent: 25,
    perDayMinutes: 60,
    perDayLabel: "1 hour",
    totalHours: 84,
  });

  assert.deepEqual(cards[1], {
    percent: 50,
    perDayMinutes: 120,
    perDayLabel: "2 hours",
    totalHours: 168,
  });

  assert.deepEqual(cards[2], {
    percent: 75,
    perDayMinutes: 180,
    perDayLabel: "3 hours",
    totalHours: 252,
  });
});

test("the smallest screen time we accept still gives a real number", () => {
  // 30 minutes a day is the minimum, so the 25% card must not read
  // "0 minutes".
  const cards = calculateAll(30);
  assert.equal(cards[0].perDayLabel, "8 minutes");
  assert.ok(cards[0].totalHours > 0);
});
