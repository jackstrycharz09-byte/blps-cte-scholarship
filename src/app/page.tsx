import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Card, Button } from "@/components/ui";
import { applicationsAreOpen } from "@/lib/config";

export default function Home() {
  const open = applicationsAreOpen();
  return (
    <PageShell title="CTE Scholarship" subtitle="Student Voice Council">
      <Card className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold text-maroon">Apply for the scholarship</h2>
        <p className="text-sm text-foreground/70">
          {open
            ? "Apply for the Bend-La Pine Schools Student Voice Council CTE Scholarship."
            : "Applications for the Bend-La Pine Schools Student Voice Council CTE Scholarship open January 1, 2027. See the requirements and get a head start."}
        </p>
        <Link href="/apply">
          <Button>{open ? "Start application" : "View requirements"}</Button>
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
