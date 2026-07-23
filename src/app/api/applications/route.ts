import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";
import { generateToken } from "@/lib/tokens";
import { applicationFormSchema, validateUploadedFile } from "@/lib/validation";
import {
  sendApplicantConfirmationEmail,
  sendRecommenderInviteEmail,
} from "@/lib/email";

const REQUIRED_FILE_KINDS = ["resume", "transcript", "cte_proof"] as const;

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const raw = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    unweightedGpa: formData.get("unweightedGpa"),
    weightedGpa: formData.get("weightedGpa"),
    cteCoursework: formData.get("cteCoursework"),
    extracurriculars: formData.get("extracurriculars"),
    essay1: formData.get("essay1"),
    essay2: formData.get("essay2"),
    essay3: formData.get("essay3"),
    recommenders: [
      {
        name: formData.get("recommender1Name"),
        email: formData.get("recommender1Email"),
      },
      {
        name: formData.get("recommender2Name"),
        email: formData.get("recommender2Email"),
      },
    ],
  };

  const parsed = applicationFormSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const values = parsed.data;

  const fileEntries: Record<(typeof REQUIRED_FILE_KINDS)[number], File> = {} as never;
  for (const kind of REQUIRED_FILE_KINDS) {
    const entry = formData.get(kind);
    if (!(entry instanceof File) || entry.size === 0) {
      return NextResponse.json({ error: `${kind} file is required.` }, { status: 400 });
    }
    const err = validateUploadedFile(kind, entry);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }
    fileEntries[kind] = entry;
  }

  const savedFiles = await Promise.all(
    REQUIRED_FILE_KINDS.map(async (kind) => {
      const file = fileEntries[kind];
      const buffer = Buffer.from(await file.arrayBuffer());
      const storagePath = await saveFile(buffer, file.name, file.type);
      return {
        kind,
        storagePath,
        originalFilename: file.name,
        mimeType: file.type,
        size: file.size,
      };
    }),
  );

  const applicant = await prisma.$transaction(async (tx) => {
    const created = await tx.applicant.create({
      data: {
        fullName: values.fullName,
        email: values.email,
        unweightedGpa: values.unweightedGpa,
        weightedGpa: values.weightedGpa,
        cteCoursework: values.cteCoursework,
        extracurriculars: values.extracurriculars,
        essay1: values.essay1,
        essay2: values.essay2,
        essay3: values.essay3,
        status: "under_review",
        files: { create: savedFiles },
        recommenders: {
          create: values.recommenders.map((r) => ({
            name: r.name,
            email: r.email,
            relationship: "",
            token: generateToken(),
            status: "not_sent",
          })),
        },
      },
      include: { recommenders: true },
    });
    return created;
  });

  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;

  await Promise.all(
    applicant.recommenders.map(async (recommender) => {
      try {
        await sendRecommenderInviteEmail({
          to: recommender.email,
          recommenderName: recommender.name,
          applicantName: applicant.fullName,
          link: `${appUrl}/recommend/${recommender.token}`,
        });
        await prisma.recommender.update({
          where: { id: recommender.id },
          data: { status: "sent", sentAt: new Date() },
        });
      } catch (err) {
        console.error(`Failed to send recommender invite to ${recommender.email}:`, err);
      }
    }),
  );

  try {
    await sendApplicantConfirmationEmail({
      to: applicant.email,
      applicantName: applicant.fullName,
    });
  } catch (err) {
    console.error(`Failed to send applicant confirmation to ${applicant.email}:`, err);
  }

  return NextResponse.json({ id: applicant.id }, { status: 201 });
}
