import { prisma } from "@/lib/prisma";
import { sendRecommenderReminderEmail } from "@/lib/email";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Finds recommenders who were sent an invite 7+ days ago, haven't submitted,
// and haven't already been reminded — sends exactly one reminder each, no
// spam loop (guarded by remindedAt).
export async function sendDueReminders(appUrl: string) {
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);

  const due = await prisma.recommender.findMany({
    where: {
      status: "sent",
      sentAt: { lte: cutoff },
      remindedAt: null,
    },
    include: { applicant: { select: { fullName: true } } },
  });

  const results: { email: string; ok: boolean }[] = [];

  for (const recommender of due) {
    try {
      await sendRecommenderReminderEmail({
        to: recommender.email,
        recommenderName: recommender.name,
        applicantName: recommender.applicant.fullName,
        link: `${appUrl}/recommend/${recommender.token}`,
      });
      await prisma.recommender.update({
        where: { id: recommender.id },
        data: { remindedAt: new Date() },
      });
      results.push({ email: recommender.email, ok: true });
    } catch (err) {
      console.error(`Failed to send reminder to ${recommender.email}:`, err);
      results.push({ email: recommender.email, ok: false });
    }
  }

  return results;
}
