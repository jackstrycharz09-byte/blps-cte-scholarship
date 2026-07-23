import { NextRequest, NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;
  const results = await sendDueReminders(appUrl);

  return NextResponse.json({
    checked: results.length,
    sent: results.filter((r) => r.ok).length,
  });
}
