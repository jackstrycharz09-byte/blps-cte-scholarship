import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";
import { recommenderFormSchema, validateUploadedFile } from "@/lib/validation";
import { sendRecommenderSubmittedConfirmationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const recommender = await prisma.recommender.findUnique({ where: { token } });
  if (!recommender) {
    return NextResponse.json({ error: "This link is invalid." }, { status: 404 });
  }
  if (recommender.status === "received") {
    return NextResponse.json(
      { error: "This letter has already been submitted." },
      { status: 403 },
    );
  }

  const formData = await request.formData();

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    relationship: formData.get("relationship"),
    letterText: formData.get("letterText") ?? undefined,
    ratings: {
      workEthic: formData.get("rating_workEthic") || undefined,
      reliability: formData.get("rating_reliability") || undefined,
      readiness: formData.get("rating_readiness") || undefined,
    },
  };

  const parsed = recommenderFormSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const values = parsed.data;

  const letterFileEntry = formData.get("letterFile");
  const hasFile = letterFileEntry instanceof File && letterFileEntry.size > 0;
  const hasText = (values.letterText?.length ?? 0) > 0;

  if (!hasFile && !hasText) {
    return NextResponse.json(
      { error: "Paste your letter text, or upload a PDF." },
      { status: 400 },
    );
  }

  let letterFileId: string | undefined;
  if (hasFile) {
    const file = letterFileEntry as File;
    const err = validateUploadedFile("recommender_letter", file);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = await saveFile(buffer, file.name);
    const created = await prisma.uploadedFile.create({
      data: {
        applicantId: recommender.applicantId,
        kind: "recommender_letter",
        storagePath,
        originalFilename: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });
    letterFileId = created.id;
  }

  const hasRatings = Object.values(values.ratings ?? {}).some((v) => v !== undefined);

  await prisma.recommender.update({
    where: { id: recommender.id },
    data: {
      name: values.name,
      email: values.email,
      relationship: values.relationship,
      letterText: hasText ? values.letterText : null,
      letterFileId: letterFileId ?? null,
      ratings: hasRatings ? JSON.stringify(values.ratings) : null,
      status: "received",
      submittedAt: new Date(),
    },
  });

  try {
    await sendRecommenderSubmittedConfirmationEmail({
      to: values.email,
      recommenderName: values.name,
      applicantName: (await prisma.applicant.findUniqueOrThrow({
        where: { id: recommender.applicantId },
        select: { fullName: true },
      })).fullName,
    });
  } catch (err) {
    console.error(`Failed to send recommender submission confirmation to ${values.email}:`, err);
  }

  return NextResponse.json({ ok: true });
}
