import type { DiaperLog, FeedingSession, Settings } from "./types";
const SESSIONS = "filt_sessions";
const SETTINGS = "filt_settings";
const ACTIVE_SESSION = "filt_active_session";
const DIAPERS = "filt_diapers";
// localStorage.setItem can throw (Safari private mode, quota exceeded) —
// swallow it so a save failure never crashes the app mid-feed.
const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore — data just won't persist this time
  }
};
const safeRemove = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};
export const getSessions = (): FeedingSession[] => {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS) || "[]");
  } catch {
    return [];
  }
};
export const saveSession = (session: FeedingSession) => {
  const limit = Date.now() - 30 * 86400000;
  const sessions = [
    session,
    ...getSessions().filter((x) => x.id !== session.id),
  ].filter((x) => x.startTime >= limit);
  safeSet(SESSIONS, JSON.stringify(sessions));
  return sessions;
};
export const removeSession = (id: string) =>
  safeSet(
    SESSIONS,
    JSON.stringify(getSessions().filter((x) => x.id !== id)),
  );
export const getActiveSession = (): FeedingSession | null => {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_SESSION) || "null");
  } catch {
    return null;
  }
};
export const saveActiveSession = (session: FeedingSession) =>
  safeSet(ACTIVE_SESSION, JSON.stringify(session));
export const clearActiveSession = () => safeRemove(ACTIVE_SESSION);
export const getDiaperLogs = (): DiaperLog[] => {
  try {
    return JSON.parse(localStorage.getItem(DIAPERS) || "[]");
  } catch {
    return [];
  }
};
export const saveDiaperLog = (log: DiaperLog) => {
  const limit = Date.now() - 30 * 86400000;
  const logs = [log, ...getDiaperLogs().filter((x) => x.id !== log.id)].filter(
    (x) => x.changedAt >= limit,
  );
  safeSet(DIAPERS, JSON.stringify(logs));
  return logs;
};
export const removeDiaperLog = (id: string) =>
  safeSet(DIAPERS, JSON.stringify(getDiaperLogs().filter((x) => x.id !== id)));
export const getSettings = (): Settings => {
  try {
    return {
      language: "ko",
      babyName: "",
      birthDate: "",
      ...JSON.parse(localStorage.getItem(SETTINGS) || "{}"),
    };
  } catch {
    return { language: "ko", babyName: "", birthDate: "" };
  }
};
export const saveSettings = (settings: Settings) =>
  safeSet(SETTINGS, JSON.stringify(settings));
