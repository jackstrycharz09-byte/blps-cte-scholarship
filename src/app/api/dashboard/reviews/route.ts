import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  applicantId: z.string().min(1),
  score: z.number().int().min(1).max(10).nullable(),
  comments: z.string().max(5000).nullable(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review data." }, { status: 400 });
  }
  const { applicantId, score, comments } = parsed.data;

  await prisma.review.upsert({
    where: {
      applicantId_committeeMemberId: {
        applicantId,
        committeeMemberId: session.user.id,
      },
    },
    update: { score, comments },
    create: {
      applicantId,
      committeeMemberId: session.user.id,
      score,
      comments,
    },
  });

  return NextResponse.json({ ok: true });
}
