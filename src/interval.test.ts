import { describe, expect, it } from "vitest";
import { nextInterval } from "./interval";
import type { FeedingSession } from "./types";

const session = (overrides: Partial<FeedingSession> = {}): FeedingSession => ({
  id: crypto.randomUUID(),
  startTime: Date.now(),
  endTime: Date.now(),
  durationMs: 20 * 60000,
  feedingType: "breast",
  breastSide: "left",
  volumeMl: null,
  diaperChanged: false,
  notes: "",
  createdAt: Date.now(),
  ...overrides,
});

describe("nextInterval", () => {
  it("falls back to the newborn base interval with low confidence when there is no history", () => {
    const result = nextInterval(undefined, 3, []);
    expect(result.ms).toBe(105 * 60000);
    expect(result.confidence).toBe("low");
  });

  it("picks the base interval by baby age in days", () => {
    const cases: [number, number][] = [
      [3, 105],
      [20, 120],
      [60, 150],
      [150, 195],
      [300, 270],
    ];
    for (const [ageDays, expectedMinutes] of cases) {
      const last = session({ durationMs: 0 });
      const result = nextInterval(last, ageDays, [last]);
      expect(result.ms).toBe(expectedMinutes * 60000);
    }
  });

  it("shortens the interval after a short feed", () => {
    const last = session({ durationMs: 5 * 60000 });
    const result = nextInterval(last, 3, [last]);
    expect(result.ms).toBe(105 * 0.8 * 60000);
    expect(result.confidence).toBe("medium");
  });

  it("lengthens the interval after a long feed", () => {
    const last = session({ durationMs: 35 * 60000 });
    const result = nextInterval(last, 3, [last]);
    expect(result.ms).toBe(105 * 1.15 * 60000);
  });

  it("shortens the interval for a small bottle volume", () => {
    const last = session({
      feedingType: "bottle",
      breastSide: null,
      volumeMl: 45,
      durationMs: 15 * 60000,
    });
    const result = nextInterval(last, 3, [last]);
    expect(result.ms).toBe(105 * 0.95 * 0.75 * 60000);
  });

  it("lengthens the interval for a large bottle volume", () => {
    const last = session({
      feedingType: "bottle",
      breastSide: null,
      volumeMl: 180,
      durationMs: 15 * 60000,
    });
    const result = nextInterval(last, 3, [last]);
    expect(result.ms).toBe(105 * 0.95 * 1.2 * 60000);
  });

  it("detects cluster feeding (3+ feeds within 90 minutes) and reports high confidence", () => {
    const now = Date.now();
    const recent = [
      session({ startTime: now - 10 * 60000 }),
      session({ startTime: now - 40 * 60000 }),
      session({ startTime: now - 80 * 60000 }),
    ];
    const result = nextInterval(recent[0], 30, recent);
    expect(result.ms).toBe(45 * 60000);
    expect(result.confidence).toBe("high");
  });

  it("clamps the interval within 30 and 480 minutes", () => {
    const veryShortBottle = session({
      feedingType: "bottle",
      breastSide: null,
      volumeMl: 10,
      durationMs: 2 * 60000,
    });
    const short = nextInterval(veryShortBottle, 3, [veryShortBottle]);
    expect(short.ms).toBeGreaterThanOrEqual(30 * 60000);

    const veryLongBottle = session({
      feedingType: "bottle",
      breastSide: null,
      volumeMl: 400,
      durationMs: 60 * 60000,
    });
    const long = nextInterval(veryLongBottle, 300, [veryLongBottle]);
    expect(long.ms).toBeLessThanOrEqual(480 * 60000);
  });
});
