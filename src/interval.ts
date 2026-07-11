import type { FeedingSession } from './types';
export function nextInterval(last: FeedingSession | undefined, ageDays: number, recent: FeedingSession[]) {
  if (!last) return { ms: 105 * 60000, confidence: 'low' as const };
  let mins = ageDays <= 7 ? 105 : ageDays <= 28 ? 120 : ageDays <= 90 ? 150 : ageDays <= 180 ? 195 : 270;
  const duration = last.durationMs / 60000;
  if (duration > 0 && duration < 10) mins *= .8; if (duration > 30) mins *= 1.15;
  if (last.feedingType === 'bottle') mins *= .95;
  if (last.volumeMl !== null && last.volumeMl < 60) mins *= .75; if ((last.volumeMl || 0) > 150) mins *= 1.2;
  if (recent.filter(s => s.startTime > Date.now() - 90 * 60000).length >= 3) mins = 45;
  return { ms: Math.max(30, Math.min(480, mins)) * 60000, confidence: duration ? 'medium' as const : 'low' as const };
}
