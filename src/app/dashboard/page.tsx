import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Button } from "@/components/ui";
import { PublishDecisionsButton } from "@/components/PublishDecisionsButton";
import {
  APPLICANT_STATUS_LABELS,
  RECOMMENDER_STATUS_LABELS,
  formatDate,
} from "@/lib/format";

const PUBLISHABLE_STATUSES = new Set(["awarded", "not_selected"]);

export default async function DashboardPage() {
  const applicants = await prisma.applicant.findMany({
    orderBy: { submittedAt: "desc" },
    include: { recommenders: true },
  });

  const pendingCount = applicants.filter(
    (a) => PUBLISHABLE_STATUSES.has(a.status) && !a.decisionPublished,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-maroon">
          Applicants ({applicants.length})
        </h2>
        <div className="flex items-center gap-3">
          <PublishDecisionsButton pendingCount={pendingCount} />
          <a href="/api/dashboard/export">
            <Button variant="secondary">Export to CSV</Button>
          </a>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-maroon/5 text-left text-foreground/70">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Unweighted GPA</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Recommenders</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => (
              <tr key={applicant.id} className="border-t border-maroon/10 hover:bg-maroon/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/${applicant.id}`}
                    className="font-medium text-maroon hover:underline"
                  >
                    {applicant.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3">{applicant.unweightedGpa.toFixed(2)}</td>
                <td className="px-4 py-3">{formatDate(applicant.submittedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    {applicant.recommenders.map((r) => (
                      <span key={r.id} className="text-xs">
                        {r.name || "(unnamed)"}: {RECOMMENDER_STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={applicant.status} published={applicant.decisionPublished} />
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/60">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function StatusBadge({ status, published }: { status: string; published: boolean }) {
  const label = APPLICANT_STATUS_LABELS[status as keyof typeof APPLICANT_STATUS_LABELS] ?? status;
  const colors: Record<string, string> = {
    under_review: "bg-amber-100 text-amber-800",
    recommended: "bg-blue-100 text-blue-800",
    not_selected: "bg-gray-200 text-gray-700",
    awarded: "bg-green-100 text-green-800",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
          colors[status] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {label}
      </span>
      {PUBLISHABLE_STATUSES.has(status) && published && (
        <span className="text-xs text-foreground/50" title="Applicant has been emailed this decision">
          Published
        </span>
      )}
    </div>
  );
}
