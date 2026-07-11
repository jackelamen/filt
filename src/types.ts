export type FeedingType = 'breast' | 'bottle';
export type Side = 'left' | 'right';
export interface FeedingSession { id: string; startTime: number; endTime: number | null; durationMs: number; feedingType: FeedingType; breastSide: Side | null; volumeMl: number | null; diaperChanged: boolean; notes: string; createdAt: number; }
export interface DiaperLog { id: string; changedAt: number; createdAt: number; }
export interface Settings { language: 'ko' | 'en'; babyName: string; birthDate: string; }
