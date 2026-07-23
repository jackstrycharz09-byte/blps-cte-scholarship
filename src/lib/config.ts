// Midnight Pacific (Bend, OR is America/Los_Angeles; Jan 1 is PST, UTC-8).
export const APPLICATIONS_OPEN_AT = new Date("2027-01-01T00:00:00-08:00");

export function applicationsAreOpen(now: Date = new Date()): boolean {
  return now.getTime() >= APPLICATIONS_OPEN_AT.getTime();
}
