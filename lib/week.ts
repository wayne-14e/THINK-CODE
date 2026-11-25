/** ISO-8601 week key in UTC, for example `2026-W48`. */
export function getIsoWeekKey(date: Date = new Date()): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function isCurrentWeek(weekKey: string | undefined | null): boolean {
  return Boolean(weekKey && weekKey === getIsoWeekKey());
}

export function effectiveWeeklyXp(profile: { weeklyXp?: number; weeklyXpWeek?: string }): number {
  return isCurrentWeek(profile.weeklyXpWeek) ? Math.max(0, profile.weeklyXp || 0) : 0;
}
