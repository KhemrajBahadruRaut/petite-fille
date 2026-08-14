const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;
const MONTH_IN_SECONDS = 30 * DAY_IN_SECONDS;

export function formatJobPostingTime(
  postedSecondsAgo: unknown,
  postedDaysAgo: unknown = 0,
): string {
  const seconds = Number(postedSecondsAgo);
  const fallbackDays = Number(postedDaysAgo);
  const elapsedSeconds =
    Number.isFinite(seconds) && seconds >= 0
      ? seconds
      : Number.isFinite(fallbackDays) && fallbackDays >= 0
        ? fallbackDays * DAY_IN_SECONDS
        : 0;

  if (elapsedSeconds < HOUR_IN_SECONDS) {
    const minutes = Math.max(1, Math.floor(elapsedSeconds / MINUTE_IN_SECONDS));
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (elapsedSeconds < DAY_IN_SECONDS) {
    const hours = Math.floor(elapsedSeconds / HOUR_IN_SECONDS);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (elapsedSeconds < MONTH_IN_SECONDS) {
    const days = Math.floor(elapsedSeconds / DAY_IN_SECONDS);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(elapsedSeconds / MONTH_IN_SECONDS);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}
