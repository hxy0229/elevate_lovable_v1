import type { Wish } from '@/hooks/useWishes';
import { parseConstraints } from '@/components/sessions/WishForm';

/** Convert "HH:MM" string to total minutes from midnight. Returns null if empty/invalid. */
export function toMinutes(t: string | null | undefined): number | null {
  if (!t || t === 'none' || t === '') return null;
  const parts = t.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
}

export interface WishScheduleInfo {
  wish: Wish;
  arriveAfterMins: number | null; // null = no constraint
  leaveByMins: number | null;     // null = no constraint
  hasConflict: boolean;
  conflictReason?: string;
}

export interface AutoArrangeResult {
  orderedIds: { id: string; sort_order: number }[];
  infos: WishScheduleInfo[];
}

/**
 * Auto-arrange wishes for a session.
 *
 * Logic:
 * 1. Parse each wish's arriveAfter / leaveBy from special_requirements.
 * 2. Sort: users who must leave earliest go first; then by arrival time.
 *    Fully flexible users fill remaining positions.
 * 3. Flag conflicts where the wish's window is too tight to fit any slot.
 *
 * @param wishes          Wishes for the instance (unsorted)
 * @param sessionStart    Session start time "HH:MM"
 * @param sessionEnd      Session end time "HH:MM"
 * @param slotMinutes     Duration of each slot in minutes (default 15)
 */
export function autoArrangeWishes(
  wishes: Wish[],
  sessionStart: string,
  sessionEnd: string,
  slotMinutes = 15,
): AutoArrangeResult {
  const sessionStartMins = toMinutes(sessionStart) ?? 0;
  const sessionEndMins = toMinutes(sessionEnd) ?? sessionStartMins + wishes.length * slotMinutes;

  // Build info objects
  const infos: WishScheduleInfo[] = wishes.map(wish => {
    const c = parseConstraints(wish.special_requirements);
    const arriveAfterMins = toMinutes(c.arriveAfter);
    const leaveByMins = toMinutes(c.leaveBy);

    // Detect conflict: window must accommodate at least one slot
    let hasConflict = false;
    let conflictReason: string | undefined;

    const effectiveStart = arriveAfterMins !== null ? Math.max(arriveAfterMins, sessionStartMins) : sessionStartMins;
    const effectiveEnd = leaveByMins !== null ? Math.min(leaveByMins, sessionEndMins) : sessionEndMins;

    if (effectiveEnd - effectiveStart < slotMinutes) {
      hasConflict = true;
      if (leaveByMins !== null && leaveByMins <= sessionStartMins) {
        conflictReason = 'Must leave before session starts';
      } else if (arriveAfterMins !== null && arriveAfterMins >= sessionEndMins) {
        conflictReason = 'Arrives after session ends';
      } else {
        conflictReason = 'Time window too narrow for a slot';
      }
    }

    return { wish, arriveAfterMins, leaveByMins, hasConflict, conflictReason };
  });

  // Separate conflicting from schedulable
  const conflicts = infos.filter(i => i.hasConflict);
  const schedulable = infos.filter(i => !i.hasConflict);

  // Sort schedulable:
  // Primary: those with leaveBy — earliest leaveBy first
  // Secondary: those without leaveBy but with arriveAfter — later arriveAfter last (they go later)
  // Tertiary: fully flexible — original order
  const withLeaveBy = schedulable.filter(i => i.leaveByMins !== null);
  const withOnlyArrival = schedulable.filter(i => i.leaveByMins === null && i.arriveAfterMins !== null);
  const flexible = schedulable.filter(i => i.leaveByMins === null && i.arriveAfterMins === null);

  withLeaveBy.sort((a, b) => (a.leaveByMins ?? 0) - (b.leaveByMins ?? 0));
  withOnlyArrival.sort((a, b) => (a.arriveAfterMins ?? 0) - (b.arriveAfterMins ?? 0));

  // Build final order: [early-leave] + [flexible] + [late-arrivals] + [conflicts at end]
  const ordered = [...withLeaveBy, ...flexible, ...withOnlyArrival, ...conflicts];

  const orderedIds = ordered.map((info, idx) => ({
    id: info.wish.id,
    sort_order: idx,
  }));

  // Preserve info order to match orderedIds
  const infoMap = Object.fromEntries(infos.map(i => [i.wish.id, i]));
  const sortedInfos = orderedIds.map(o => infoMap[o.id]);

  return { orderedIds, infos: sortedInfos };
}
