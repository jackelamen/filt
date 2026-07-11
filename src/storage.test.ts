import { beforeEach, describe, expect, it } from "vitest";
import {
  clearActiveSession,
  getActiveSession,
  getDiaperLogs,
  getSessions,
  getSettings,
  removeDiaperLog,
  removeSession,
  saveActiveSession,
  saveDiaperLog,
  saveSession,
  saveSettings,
} from "./storage";
import type { DiaperLog, FeedingSession } from "./types";

const session = (overrides: Partial<FeedingSession> = {}): FeedingSession => ({
  id: crypto.randomUUID(),
  startTime: Date.now(),
  endTime: Date.now(),
  durationMs: 10 * 60000,
  feedingType: "breast",
  breastSide: "left",
  volumeMl: null,
  diaperChanged: false,
  notes: "",
  createdAt: Date.now(),
  ...overrides,
});

const diaper = (overrides: Partial<DiaperLog> = {}): DiaperLog => ({
  id: crypto.randomUUID(),
  changedAt: Date.now(),
  createdAt: Date.now(),
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
});

describe("sessions", () => {
  it("starts empty", () => {
    expect(getSessions()).toEqual([]);
  });

  it("saves a session and returns it newest-first", () => {
    const older = session({ startTime: Date.now() - 1000 });
    const newer = session({ startTime: Date.now() });
    saveSession(older);
    const result = saveSession(newer);
    expect(result.map((s) => s.id)).toEqual([newer.id, older.id]);
  });

  it("overwrites a session with the same id instead of duplicating it", () => {
    const s = session();
    saveSession(s);
    const updated = { ...s, durationMs: 99 };
    const result = saveSession(updated);
    expect(result).toHaveLength(1);
    expect(result[0].durationMs).toBe(99);
  });

  it("drops sessions older than 30 days", () => {
    const stale = session({ startTime: Date.now() - 31 * 86400000 });
    const fresh = session({ startTime: Date.now() });
    saveSession(stale);
    const result = saveSession(fresh);
    expect(result.map((s) => s.id)).toEqual([fresh.id]);
  });

  it("removes a session by id", () => {
    const a = session();
    const b = session();
    saveSession(a);
    saveSession(b);
    removeSession(a.id);
    expect(getSessions().map((s) => s.id)).toEqual([b.id]);
  });
});

describe("active session", () => {
  it("is null when nothing is in progress", () => {
    expect(getActiveSession()).toBeNull();
  });

  it("persists and clears the in-progress session", () => {
    const s = session({ endTime: null, durationMs: 0 });
    saveActiveSession(s);
    expect(getActiveSession()?.id).toBe(s.id);
    clearActiveSession();
    expect(getActiveSession()).toBeNull();
  });
});

describe("diaper logs", () => {
  it("saves newest-first and trims to 30 days", () => {
    const stale = diaper({ changedAt: Date.now() - 31 * 86400000 });
    const fresh = diaper({ changedAt: Date.now() });
    saveDiaperLog(stale);
    const result = saveDiaperLog(fresh);
    expect(result.map((d) => d.id)).toEqual([fresh.id]);
  });

  it("removes a diaper log by id", () => {
    const a = diaper();
    saveDiaperLog(a);
    removeDiaperLog(a.id);
    expect(getDiaperLogs()).toEqual([]);
  });
});

describe("settings", () => {
  it("defaults to Korean with empty baby info", () => {
    expect(getSettings()).toEqual({
      language: "ko",
      babyName: "",
      birthDate: "",
    });
  });

  it("round-trips saved settings", () => {
    saveSettings({ language: "en", babyName: "Aria", birthDate: "2026-01-01" });
    expect(getSettings()).toEqual({
      language: "en",
      babyName: "Aria",
      birthDate: "2026-01-01",
    });
  });
});
