import test from "node:test";
import assert from "node:assert/strict";

import { validateGoal, validateScreenTime } from "./validate.js";

test("rejects when both screen time boxes are empty", () => {
  const result = validateScreenTime("", "");
  assert.equal(result.ok, false);
});

test("accepts hours and minutes together", () => {
  const result = validateScreenTime("3", "30");
  assert.equal(result.ok, true);
  assert.equal(result.totalMinutes, 210);
});

test("treats a blank minutes box as zero", () => {
  const result = validateScreenTime("4", "");
  assert.equal(result.ok, true);
  assert.equal(result.totalMinutes, 240);
});

test("treats a blank hours box as zero", () => {
  const result = validateScreenTime("", "45");
  assert.equal(result.ok, true);
  assert.equal(result.totalMinutes, 45);
});

test("rejects text that isn't a number", () => {
  const result = validateScreenTime("lots", "0");
  assert.equal(result.ok, false);
});

test("rejects negative numbers", () => {
  const result = validateScreenTime("-1", "0");
  assert.equal(result.ok, false);
});

test("rejects 60 or more minutes", () => {
  const result = validateScreenTime("1", "60");
  assert.equal(result.ok, false);
});

test("rejects more than 24 hours", () => {
  const result = validateScreenTime("25", "0");
  assert.equal(result.ok, false);
});

test("rejects under half an hour a day", () => {
  const result = validateScreenTime("0", "20");
  assert.equal(result.ok, false);
});

test("accepts exactly half an hour a day", () => {
  const result = validateScreenTime("0", "30");
  assert.equal(result.ok, true);
});

test("rejects an empty goal", () => {
  const result = validateGoal("   ");
  assert.equal(result.ok, false);
});

test("accepts and trims a goal", () => {
  const result = validateGoal("  learn Spanish  ");
  assert.equal(result.ok, true);
  assert.equal(result.goal, "learn Spanish");
});

test("rejects a goal that's too long", () => {
  const result = validateGoal("a".repeat(200));
  assert.equal(result.ok, false);
});
