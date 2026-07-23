export const APPLICANT_STATUS_OPTIONS = [
  "under_review",
  "recommended",
  "not_selected",
  "awarded",
] as const;

export type ApplicantStatus = (typeof APPLICANT_STATUS_OPTIONS)[number];

export const APPLICANT_STATUS_LABELS: Record<ApplicantStatus, string> = {
  under_review: "Under Review",
  recommended: "Recommended",
  not_selected: "Not Selected",
  awarded: "Awarded",
};

export const RECOMMENDER_STATUS_LABELS: Record<string, string> = {
  not_sent: "Not yet sent",
  sent: "Sent, awaiting response",
  received: "Received",
};

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
