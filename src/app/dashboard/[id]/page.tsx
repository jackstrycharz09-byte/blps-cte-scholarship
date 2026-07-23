import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { StatusControl } from "@/components/StatusControl";
import { ReviewForm } from "@/components/ReviewForm";
import { RECOMMENDER_STATUS_LABELS, formatDate } from "@/lib/format";
import { RATING_TRAITS } from "@/lib/validation";

const FILE_KIND_LABELS: Record<string, string> = {
  resume: "Resume",
  transcript: "Transcript",
  cte_proof: "Proof of CTE coursework",
};

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: {
      files: true,
      recommenders: { include: { letterFile: true } },
      reviews: { include: { committeeMember: true } },
    },
  });

  if (!applicant) notFound();

  const myReview = applicant.reviews.find(
    (r) => r.committeeMemberId === session?.user?.id,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-maroon">{applicant.fullName}</h2>
          <p className="text-sm text-foreground/60">{applicant.email}</p>
        </div>
        <StatusControl applicantId={applicant.id} initialStatus={applicant.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-maroon">Application</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-foreground/60">Unweighted GPA</dt>
                <dd>{applicant.unweightedGpa.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-foreground/60">Weighted GPA</dt>
                <dd>{applicant.weightedGpa.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-foreground/60">Submitted</dt>
                <dd>{formatDate(applicant.submittedAt)}</dd>
              </div>
            </dl>
            <div>
              <h4 className="text-sm font-medium text-foreground/70 mb-1">CTE coursework</h4>
              <p className="text-sm whitespace-pre-wrap">{applicant.cteCoursework}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground/70 mb-1">Extracurricular activities</h4>
              <p className="text-sm whitespace-pre-wrap">{applicant.extracurriculars}</p>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-heading text-lg font-bold text-maroon">Essays</h3>
            <EssayBlock label="Essay 1" text={applicant.essay1} />
            <EssayBlock label="Essay 2" text={applicant.essay2} />
            <EssayBlock label="Essay 3" text={applicant.essay3} />
          </Card>

          <Card className="space-y-2">
            <h3 className="font-heading text-lg font-bold text-maroon">Uploaded files</h3>
            <ul className="text-sm space-y-1">
              {applicant.files
                .filter((f) => f.kind !== "recommender_letter")
                .map((f) => (
                  <li key={f.id}>
                    <a href={`/api/files/${f.id}`} className="text-maroon hover:underline">
                      {FILE_KIND_LABELS[f.kind] ?? f.kind}: {f.originalFilename}
                    </a>
                  </li>
                ))}
            </ul>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-heading text-lg font-bold text-maroon">Recommendation letters</h3>
            {applicant.recommenders.map((r) => (
              <div key={r.id} className="border-t border-maroon/10 pt-4 first:border-0 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {r.name} &middot; {r.relationship || "relationship not yet given"}
                  </p>
                  <span className="text-xs rounded-full bg-maroon/10 px-2 py-0.5">
                    {RECOMMENDER_STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>
                <p className="text-xs text-foreground/60">{r.email}</p>
                {r.status === "received" ? (
                  <>
                    {r.letterText && (
                      <p className="text-sm whitespace-pre-wrap bg-cream/60 rounded p-3">
                        {r.letterText}
                      </p>
                    )}
                    {r.letterFile && (
                      <a
                        href={`/api/files/${r.letterFile.id}`}
                        className="text-sm text-maroon hover:underline"
                      >
                        Download letter ({r.letterFile.originalFilename})
                      </a>
                    )}
                    {r.ratings && <RatingsDisplay ratings={r.ratings} />}
                    <p className="text-xs text-foreground/50">
                      Submitted {r.submittedAt ? formatDate(r.submittedAt) : ""}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-foreground/60">Not yet submitted.</p>
                )}
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-6">
          <ReviewForm
            applicantId={applicant.id}
            initialScore={myReview?.score ?? null}
            initialComments={myReview?.comments ?? null}
          />
          <Card className="space-y-2">
            <h3 className="font-heading text-lg font-bold text-maroon">All reviews</h3>
            {applicant.reviews.length === 0 && (
              <p className="text-sm text-foreground/60">No reviews yet.</p>
            )}
            <ul className="space-y-2 text-sm">
              {applicant.reviews.map((r) => (
                <li key={r.id} className="border-t border-maroon/10 pt-2 first:border-0 first:pt-0">
                  <p className="font-medium">
                    {r.committeeMember.name}
                    {r.score != null && <span className="text-foreground/60"> &middot; {r.score}/10</span>}
                  </p>
                  {r.comments && <p className="text-foreground/70">{r.comments}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EssayBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-foreground/70 mb-1">{label}</h4>
      <p className="text-sm whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function RatingsDisplay({ ratings }: { ratings: string }) {
  let parsed: Record<string, number> = {};
  try {
    parsed = JSON.parse(ratings);
  } catch {
    return null;
  }
  return (
    <div className="flex gap-4 text-xs text-foreground/70">
      {RATING_TRAITS.map((trait) =>
        parsed[trait.key] != null ? (
          <span key={trait.key}>
            {trait.label}: {parsed[trait.key]}/5
          </span>
        ) : null,
      )}
    </div>
  );
}
