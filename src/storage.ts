import type { DiaperLog, FeedingSession, Settings } from "./types";
const SESSIONS = "filt_sessions";
const SETTINGS = "filt_settings";
const ACTIVE_SESSION = "filt_active_session";
const DIAPERS = "filt_diapers";
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
  localStorage.setItem(SESSIONS, JSON.stringify(sessions));
  return sessions;
};
export const removeSession = (id: string) =>
  localStorage.setItem(
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
  localStorage.setItem(ACTIVE_SESSION, JSON.stringify(session));
export const clearActiveSession = () => localStorage.removeItem(ACTIVE_SESSION);
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
  localStorage.setItem(DIAPERS, JSON.stringify(logs));
  return logs;
};
export const removeDiaperLog = (id: string) =>
  localStorage.setItem(DIAPERS, JSON.stringify(getDiaperLogs().filter((x) => x.id !== id)));
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
  localStorage.setItem(SETTINGS, JSON.stringify(settings));
