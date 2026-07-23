import { PageShell } from "@/components/PageShell";
import { ApplicationForm } from "@/components/ApplicationForm";
import { Card } from "@/components/ui";
import { getApplicationWindowStatus } from "@/lib/config";
import {
  ESSAY_PROMPTS,
  MIN_UNWEIGHTED_GPA,
  MIN_ESSAY_WORDS,
  MAX_ESSAY_WORDS,
} from "@/lib/validation";

// Without this, Next.js prerenders the page once at build time and the
// open/closed check would never re-evaluate — it'd be stuck on whatever
// state was true the moment this was last deployed.
export const dynamic = "force-dynamic";

function Requirements() {
  return (
    <>
      <div>
        <h3 className="font-medium text-foreground">Eligibility</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground/80">
          <li>Unweighted GPA of at least {MIN_UNWEIGHTED_GPA.toFixed(1)}</li>
          <li>
            CTE coursework is strongly recommended, but a year-long CTE-related internship or project
            also qualifies
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-medium text-foreground">Required documents</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground/80">
          <li>Resume (PDF)</li>
          <li>Transcript (PDF)</li>
          <li>Proof of CTE coursework, internship, or project (PDF or image)</li>
        </ul>
      </div>

      <div>
        <h3 className="font-medium text-foreground">Two recommenders</h3>
        <p className="mt-1 text-sm text-foreground/80">
          You&rsquo;ll list two recommenders&rsquo; names and emails. Each is automatically sent a
          unique link to submit a letter of recommendation on your behalf once you apply.
        </p>
      </div>

      <div>
        <h3 className="font-medium text-foreground">
          Three essays ({MIN_ESSAY_WORDS}&ndash;{MAX_ESSAY_WORDS} words each)
        </h3>
        <ol className="mt-1 list-decimal space-y-2 pl-5 text-sm text-foreground/80">
          {ESSAY_PROMPTS.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ol>
      </div>
    </>
  );
}

export default function ApplyPage() {
  const windowStatus = getApplicationWindowStatus();

  if (windowStatus === "not_yet_open") {
    return (
      <PageShell title="CTE Scholarship Application" subtitle="Student Voice Council">
        <Card className="space-y-5">
          <div>
            <h2 className="font-heading text-xl font-bold text-maroon">
              Applications open December 1, 2026
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              This form isn&rsquo;t accepting submissions yet. Here&rsquo;s what you&rsquo;ll need so
              you can get a head start before it opens.
            </p>
          </div>
          <Requirements />
        </Card>
      </PageShell>
    );
  }

  if (windowStatus === "closed") {
    return (
      <PageShell title="CTE Scholarship Application" subtitle="Student Voice Council">
        <Card>
          <h2 className="font-heading text-xl font-bold text-maroon">Applications closed</h2>
          <p className="mt-2 text-sm text-foreground/70">
            The application window closed on February 28, 2027. If you have questions about your
            submission, please contact the Student Voice Council.
          </p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="CTE Scholarship Application" subtitle="Student Voice Council">
      <p className="mb-6 text-sm text-foreground/70">
        All fields are required. You&rsquo;ll need PDF copies of your resume and transcript, plus proof of
        your CTE coursework, internship, or project, ready to upload before you start. CTE coursework is
        strongly recommended, but a year-long CTE-related internship or project also qualifies.
      </p>
      <ApplicationForm />
    </PageShell>
  );
}
