import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Card, Button } from "@/components/ui";

export default function Home() {
  return (
    <PageShell title="CTE Scholarship" subtitle="Student Voice Council">
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-bold text-maroon">Students</h2>
          <p className="text-sm text-foreground/70">
            Apply for the Bend-La Pine Schools Student Voice Council CTE Scholarship.
          </p>
          <Link href="/apply" className="mt-auto">
            <Button className="w-full">Start application</Button>
          </Link>
        </Card>
        <Card className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-bold text-maroon">Committee</h2>
          <p className="text-sm text-foreground/70">
            Review submitted applications and recommendation letters.
          </p>
          <Link href="/login" className="mt-auto">
            <Button variant="secondary" className="w-full">
              Committee login
            </Button>
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}
