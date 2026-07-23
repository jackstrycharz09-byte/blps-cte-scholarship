import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { APPLICANT_STATUS_OPTIONS } from "@/lib/format";

const bodySchema = z.object({
  applicantId: z.string().min(1),
  status: z.enum(APPLICANT_STATUS_OPTIONS),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  await prisma.applicant.update({
    where: { id: parsed.data.applicantId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true });
}
