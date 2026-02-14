/**
 * Format a time string (HH:MM or HH:MM:SS) to 12-hour format with AM/PM.
 */
export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculate end time given a start time and number of 15-minute song slots.
 */
export function calculateSchedule(startTime: string, songCount: number): { times: string[]; endTime: string } {
  const [startH, startM] = startTime.split(':').map(Number);
  let totalMinutes = startH * 60 + startM;
  const times: string[] = [];

  for (let i = 0; i < songCount; i++) {
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    const start = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    totalMinutes += 15;
    const eh = Math.floor(totalMinutes / 60) % 24;
    const em = totalMinutes % 60;
    const end = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
    times.push(`${formatTime12h(start)} – ${formatTime12h(end)}`);
  }

  const eh = Math.floor(totalMinutes / 60) % 24;
  const em = totalMinutes % 60;
  const endTime = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;

  return { times, endTime };
}

/**
 * Format a date string to a readable format.
 */
export function formatSessionDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr + 'T00:00:00+08:00'); // SGT
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
