import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Resend } from "resend";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "BLPS SVC CTE Scholarship <onboarding@resend.dev>";

const DEV_EMAIL_DIR = path.join(process.cwd(), ".dev-emails");

// Without a real RESEND_API_KEY (the default until the account is wired up
// per DEPLOYMENT.md), emails are written to ./.dev-emails and logged to the
// console instead of failing, so the full flow is verifiable locally.
export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    await mkdir(DEV_EMAIL_DIR, { recursive: true });
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.html`;
    await writeFile(
      path.join(DEV_EMAIL_DIR, filename),
      `<!-- To: ${to} -->\n<!-- Subject: ${subject} -->\n${html}`,
    );
    console.log(`[dev email] to=${to} subject="${subject}" -> .dev-emails/${filename}`);
    return { id: filename, dev: true };
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });
  if (result.error) {
    throw new Error(`Failed to send email to ${to}: ${result.error.message}`);
  }
  return { id: result.data?.id ?? "unknown", dev: false };
}

function wrapEmail(bodyHtml: string) {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto;">
    <div style="background:#7A1F2B; color:#F4EFE9; padding:20px 24px;">
      <strong style="font-size:18px;">Bend-La Pine Schools</strong><br />
      <span style="font-size:14px;">Student Voice Council &middot; CTE Scholarship</span>
    </div>
    <div style="background:#F4EFE9; color:#2a1013; padding:24px; font-family: Georgia, 'Times New Roman', serif;">
      ${bodyHtml}
    </div>
  </div>`;
}

export async function sendApplicantConfirmationEmail(args: {
  to: string;
  applicantName: string;
}) {
  return sendEmail({
    to: args.to,
    subject: "We received your CTE Scholarship application",
    html: wrapEmail(`
      <p>Hi ${args.applicantName},</p>
      <p>Thanks for submitting your application for the Bend-La Pine Schools Student Voice Council CTE Scholarship. We've received it along with your uploaded documents.</p>
      <p>Your two recommenders have been emailed a link to submit their letters of recommendation. You do not need to do anything else right now — the committee will be in touch after the review period.</p>
      <p>Good luck!</p>
    `),
  });
}

export async function sendRecommenderInviteEmail(args: {
  to: string;
  recommenderName: string;
  applicantName: string;
  link: string;
}) {
  return sendEmail({
    to: args.to,
    subject: `Letter of recommendation requested for ${args.applicantName}`,
    html: wrapEmail(`
      <p>Hi ${args.recommenderName},</p>
      <p>${args.applicantName} has listed you as a recommender for the Bend-La Pine Schools Student Voice Council CTE Scholarship, and has asked you to submit a letter of recommendation on their behalf.</p>
      <p><a href="${args.link}" style="color:#7A1F2B; font-weight:bold;">Submit your letter of recommendation</a></p>
      <p>This link is unique to you and can only be used once. If you're not able to complete it right away, no problem — it will stay valid until you submit it.</p>
    `),
  });
}

export async function sendRecommenderReminderEmail(args: {
  to: string;
  recommenderName: string;
  applicantName: string;
  link: string;
}) {
  return sendEmail({
    to: args.to,
    subject: `Reminder: letter of recommendation for ${args.applicantName}`,
    html: wrapEmail(`
      <p>Hi ${args.recommenderName},</p>
      <p>This is a friendly one-time reminder that ${args.applicantName} is still waiting on your letter of recommendation for the Bend-La Pine Schools Student Voice Council CTE Scholarship.</p>
      <p><a href="${args.link}" style="color:#7A1F2B; font-weight:bold;">Submit your letter of recommendation</a></p>
    `),
  });
}

export async function sendRecommenderSubmittedConfirmationEmail(args: {
  to: string;
  recommenderName: string;
  applicantName: string;
}) {
  return sendEmail({
    to: args.to,
    subject: `Thanks for your letter for ${args.applicantName}`,
    html: wrapEmail(`
      <p>Hi ${args.recommenderName},</p>
      <p>Thanks for submitting your letter of recommendation for ${args.applicantName}. It's been recorded and shared with the scholarship committee. No further action is needed from you.</p>
    `),
  });
}

export async function sendDecisionEmail(args: {
  to: string;
  applicantName: string;
  status: "awarded" | "not_selected";
}) {
  if (args.status === "awarded") {
    return sendEmail({
      to: args.to,
      subject: "You've been awarded the CTE Scholarship",
      html: wrapEmail(`
        <p>Hi ${args.applicantName},</p>
        <p>Congratulations! The Student Voice Council is pleased to award you the Bend-La Pine Schools CTE Scholarship. Thank you for the work you put into your application.</p>
        <p>Someone from the committee will follow up with next steps.</p>
      `),
    });
  }
  return sendEmail({
    to: args.to,
    subject: "Update on your CTE Scholarship application",
    html: wrapEmail(`
      <p>Hi ${args.applicantName},</p>
      <p>Thank you for applying for the Bend-La Pine Schools Student Voice Council CTE Scholarship. After careful review, we were not able to select you for this year's award.</p>
      <p>We received a strong pool of applicants, and we appreciate the time you put into your application. We encourage you to stay involved in your CTE pathway and to consider applying again in the future.</p>
    `),
  });
}
