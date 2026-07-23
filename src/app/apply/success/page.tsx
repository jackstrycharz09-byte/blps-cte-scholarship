import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui";

export default function ApplySuccessPage() {
  return (
    <PageShell title="CTE Scholarship Application" subtitle="Student Voice Council">
      <Card>
        <h2 className="font-heading text-xl font-bold text-maroon mb-2">Application submitted</h2>
        <p className="text-sm text-foreground/80">
          Thanks for applying! A confirmation email is on its way to you, and your two recommenders have
          been emailed a unique link to submit their letters of recommendation. You don&rsquo;t need to do
          anything else &mdash; the committee will follow up after the review period.
        </p>
      </Card>
    </PageShell>
  );
}
