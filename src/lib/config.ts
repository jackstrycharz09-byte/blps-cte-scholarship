// Midnight Pacific (Bend, OR is America/Los_Angeles; both dates fall in PST, UTC-8).
export const APPLICATIONS_OPEN_AT = new Date("2026-12-01T00:00:00-08:00");
// Applications close at the end of Feb 28 — i.e. up through midnight starting Mar 1.
export const APPLICATIONS_CLOSE_AT = new Date("2027-03-01T00:00:00-08:00");

export type ApplicationWindowStatus = "not_yet_open" | "open" | "closed";

export function getApplicationWindowStatus(now: Date = new Date()): ApplicationWindowStatus {
  if (now.getTime() < APPLICATIONS_OPEN_AT.getTime()) return "not_yet_open";
  if (now.getTime() >= APPLICATIONS_CLOSE_AT.getTime()) return "closed";
  return "open";
}

export function applicationsAreOpen(now: Date = new Date()): boolean {
  return getApplicationWindowStatus(now) === "open";
}
