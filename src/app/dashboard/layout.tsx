import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { PageShell } from "@/components/PageShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <PageShell
      title="Committee Review Dashboard"
      subtitle="CTE Scholarship"
      wide
      headerRight={
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="flex items-center gap-3"
        >
          <span className="text-cream/85">{session.user?.name}</span>
          <button type="submit" className="underline underline-offset-2">
            Sign out
          </button>
        </form>
      }
    >
      {children}
    </PageShell>
  );
}
