import type { FeedingSession, Settings } from './types';
const SESSIONS = 'filt_sessions'; const SETTINGS = 'filt_settings';
export const getSessions = (): FeedingSession[] => { try { return JSON.parse(localStorage.getItem(SESSIONS) || '[]'); } catch { return []; } };
export const saveSession = (session: FeedingSession) => { const limit = Date.now() - 30 * 86400000; const sessions = [session, ...getSessions().filter(x => x.id !== session.id)].filter(x => x.startTime >= limit); localStorage.setItem(SESSIONS, JSON.stringify(sessions)); return sessions; };
export const removeSession = (id: string) => localStorage.setItem(SESSIONS, JSON.stringify(getSessions().filter(x => x.id !== id)));
export const getSettings = (): Settings => { try { return { language: 'ko', babyName: '', birthDate: '', ...JSON.parse(localStorage.getItem(SETTINGS) || '{}') }; } catch { return { language: 'ko', babyName: '', birthDate: '' }; } };
export const saveSettings = (settings: Settings) => localStorage.setItem(SETTINGS, JSON.stringify(settings));
