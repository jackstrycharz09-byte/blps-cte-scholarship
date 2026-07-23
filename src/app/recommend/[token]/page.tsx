import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui";
import { RecommenderForm } from "@/components/RecommenderForm";

export default async function RecommendPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const recommender = await prisma.recommender.findUnique({
    where: { token },
    include: { applicant: { select: { fullName: true } } },
  });

  if (!recommender) {
    return (
      <PageShell title="Letter of Recommendation" minimal>
        <Card>
          <h2 className="font-heading text-lg font-bold text-maroon mb-2">Link not found</h2>
          <p className="text-sm text-foreground/80">
            This recommendation link isn&rsquo;t valid. Please check the link in your email, or contact
            the applicant to confirm they sent you the right one.
          </p>
        </Card>
      </PageShell>
    );
  }

  if (recommender.status === "received") {
    return (
      <PageShell
        title={`Letter of Recommendation for ${recommender.applicant.fullName}`}
        subtitle="Bend-La Pine Schools CTE Scholarship"
        minimal
      >
        <Card>
          <h2 className="font-heading text-lg font-bold text-maroon mb-2">Already submitted</h2>
          <p className="text-sm text-foreground/80">
            Thanks &mdash; your letter of recommendation has already been submitted and can&rsquo;t be
            changed. If you need to update it, please contact the scholarship committee directly.
          </p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Letter of Recommendation for ${recommender.applicant.fullName}`}
      subtitle="Bend-La Pine Schools CTE Scholarship"
      minimal
    >
      <RecommenderForm
        token={token}
        applicantName={recommender.applicant.fullName}
        defaultName={recommender.name}
        defaultEmail={recommender.email}
      />
    </PageShell>
  );
}
