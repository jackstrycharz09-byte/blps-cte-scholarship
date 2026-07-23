import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendDecisionEmail } from "@/lib/email";

const PUBLISHABLE_STATUSES = ["awarded", "not_selected"] as const;

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const pending = await prisma.applicant.findMany({
    where: { status: { in: [...PUBLISHABLE_STATUSES] }, decisionPublished: false },
  });

  let published = 0;
  let failed = 0;

  for (const applicant of pending) {
    try {
      await sendDecisionEmail({
        to: applicant.email,
        applicantName: applicant.fullName,
        status: applicant.status as "awarded" | "not_selected",
      });
      await prisma.applicant.update({
        where: { id: applicant.id },
        data: { decisionPublished: true },
      });
      published += 1;
    } catch (err) {
      console.error(`Failed to publish decision for ${applicant.email}:`, err);
      failed += 1;
    }
  }

  return NextResponse.json({ published, failed, checked: pending.length });
}
