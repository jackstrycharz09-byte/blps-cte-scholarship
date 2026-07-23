import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import { APPLICANT_STATUS_LABELS, RECOMMENDER_STATUS_LABELS, formatDate } from "@/lib/format";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const [applicants, committeeMembers] = await Promise.all([
    prisma.applicant.findMany({
      orderBy: { submittedAt: "desc" },
      include: {
        recommenders: true,
        reviews: { include: { committeeMember: true } },
      },
    }),
    prisma.committeeMember.findMany({ orderBy: { name: "asc" } }),
  ]);

  const header = [
    "Full name",
    "Email",
    "Unweighted GPA",
    "Weighted GPA",
    "Submitted",
    "Status",
    "Decision published",
    "Recommender 1",
    "Recommender 1 status",
    "Recommender 2",
    "Recommender 2 status",
    ...committeeMembers.map((m) => `${m.name} score`),
    ...committeeMembers.map((m) => `${m.name} comments`),
  ];

  const rows = applicants.map((applicant) => {
    const [rec1, rec2] = applicant.recommenders;
    const reviewByMember = new Map(applicant.reviews.map((r) => [r.committeeMemberId, r]));
    return [
      applicant.fullName,
      applicant.email,
      applicant.unweightedGpa.toFixed(2),
      applicant.weightedGpa.toFixed(2),
      formatDate(applicant.submittedAt),
      APPLICANT_STATUS_LABELS[applicant.status as keyof typeof APPLICANT_STATUS_LABELS] ??
        applicant.status,
      applicant.decisionPublished ? "Yes" : "No",
      rec1?.name ?? "",
      rec1 ? (RECOMMENDER_STATUS_LABELS[rec1.status] ?? rec1.status) : "",
      rec2?.name ?? "",
      rec2 ? (RECOMMENDER_STATUS_LABELS[rec2.status] ?? rec2.status) : "",
      ...committeeMembers.map((m) => {
        const review = reviewByMember.get(m.id);
        return review?.score != null ? String(review.score) : "";
      }),
      ...committeeMembers.map((m) => reviewByMember.get(m.id)?.comments ?? ""),
    ];
  });

  const csv = toCsv([header, ...rows]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cte-scholarship-applicants-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
