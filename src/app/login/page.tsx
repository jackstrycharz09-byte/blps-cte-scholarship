import { PageShell } from "@/components/PageShell";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <PageShell title="Committee Login" subtitle="CTE Scholarship Review">
      <LoginForm />
    </PageShell>
  );
}
