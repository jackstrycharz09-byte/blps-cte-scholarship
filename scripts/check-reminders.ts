import "dotenv/config";
import { sendDueReminders } from "../src/lib/reminders";
import { prisma } from "../src/lib/prisma";

async function main() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const results = await sendDueReminders(appUrl);
  console.log(`Checked ${results.length} recommender(s) due for a reminder.`);
  for (const r of results) {
    console.log(`  ${r.ok ? "sent" : "FAILED"} -> ${r.email}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
