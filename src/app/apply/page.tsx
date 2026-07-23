import { PageShell } from "@/components/PageShell";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function ApplyPage() {
  return (
    <PageShell
      title="CTE Scholarship Application"
      subtitle="Student Voice Council"
    >
      <p className="mb-6 text-sm text-foreground/70">
        All fields are required. You&rsquo;ll need PDF copies of your resume and transcript, plus proof of
        your CTE coursework, internship, or project, ready to upload before you start. CTE coursework is
        strongly recommended, but a year-long CTE-related internship or project also qualifies.
      </p>
      <ApplicationForm />
    </PageShell>
  );
}
