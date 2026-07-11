import type { FeedingSession } from './types';
export type Confidence = 'low' | 'medium' | 'high';
export function nextInterval(last: FeedingSession | undefined, ageDays: number, recent: FeedingSession[]) {
  if (!last) return { ms: 105 * 60000, confidence: 'low' as Confidence };
  let mins = ageDays <= 7 ? 105 : ageDays <= 28 ? 120 : ageDays <= 90 ? 150 : ageDays <= 180 ? 195 : 270;
  const duration = last.durationMs / 60000;
  if (duration > 0 && duration < 10) mins *= .8; if (duration > 30) mins *= 1.15;
  if (last.feedingType === 'bottle') mins *= .95;
  if (last.volumeMl !== null && last.volumeMl < 60) mins *= .75; if ((last.volumeMl || 0) > 150) mins *= 1.2;
  const isCluster = recent.filter(s => s.startTime > Date.now() - 90 * 60000).length >= 3;
  if (isCluster) mins = 45;
  const confidence: Confidence = isCluster ? 'high' : duration ? 'medium' : 'low';
  return { ms: Math.max(30, Math.min(480, mins)) * 60000, confidence };
}
