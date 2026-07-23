import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Card, Button } from "@/components/ui";
import { getApplicationWindowStatus } from "@/lib/config";

const COPY = {
  not_yet_open: {
    body: "Applications for the Bend-La Pine Schools Student Voice Council CTE Scholarship open December 1, 2026. See the requirements and get a head start.",
    button: "View requirements",
  },
  open: {
    body: "Apply for the Bend-La Pine Schools Student Voice Council CTE Scholarship.",
    button: "Start application",
  },
  closed: {
    body: "The application window for the Bend-La Pine Schools Student Voice Council CTE Scholarship closed on February 28, 2027.",
    button: "Learn more",
  },
} as const;

// See src/app/apply/page.tsx for why this is required.
export const dynamic = "force-dynamic";

export default function Home() {
  const { body, button } = COPY[getApplicationWindowStatus()];
  return (
    <PageShell title="CTE Scholarship" subtitle="Student Voice Council">
      <Card className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold text-maroon">Apply for the scholarship</h2>
        <p className="text-sm text-foreground/70">{body}</p>
        <Link href="/apply">
          <Button>{button}</Button>
        </Link>
      </Card>
      <p className="mt-8 text-center text-xs text-foreground/40">
        <Link href="/login" className="hover:underline">
          Committee login
        </Link>
      </p>
    </PageShell>
  );
}
