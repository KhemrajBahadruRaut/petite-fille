const APPLIED_JOB_IDS_STORAGE_KEY = "petite-fille-applied-job-ids";

export function getAppliedJobIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const storedIds = JSON.parse(
      window.localStorage.getItem(APPLIED_JOB_IDS_STORAGE_KEY) || "[]",
    );

    return Array.isArray(storedIds)
      ? storedIds.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function hasAppliedForJob(jobId: string): boolean {
  return getAppliedJobIds().includes(jobId);
}

export function markJobAsApplied(jobId: string): void {
  if (typeof window === "undefined") return;

  const appliedJobIds = getAppliedJobIds();
  if (appliedJobIds.includes(jobId)) return;

  try {
    window.localStorage.setItem(
      APPLIED_JOB_IDS_STORAGE_KEY,
      JSON.stringify([...appliedJobIds, jobId]),
    );
  } catch {
    // The successful submission is still shown even if browser storage is unavailable.
  }
}
