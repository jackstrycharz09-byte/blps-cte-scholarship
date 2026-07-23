import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Card, Button } from "@/components/ui";

export default function Home() {
  return (
    <PageShell title="CTE Scholarship" subtitle="Student Voice Council">
      <Card className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold text-maroon">Apply for the scholarship</h2>
        <p className="text-sm text-foreground/70">
          Apply for the Bend-La Pine Schools Student Voice Council CTE Scholarship.
        </p>
        <Link href="/apply">
          <Button>Start application</Button>
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
