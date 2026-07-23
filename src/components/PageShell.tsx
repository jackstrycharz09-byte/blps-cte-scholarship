import { Header } from "./Header";

export function PageShell({
  title,
  subtitle,
  minimal = false,
  wide = false,
  headerRight,
  children,
}: {
  title: string;
  subtitle?: string;
  minimal?: boolean;
  wide?: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header title={title} subtitle={subtitle} minimal={minimal} wide={wide} right={headerRight} />
      <main
        className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 ${
          wide ? "max-w-6xl" : "max-w-4xl"
        }`}
      >
        {children}
      </main>
      <footer className="border-t border-maroon/15 py-4 text-center text-xs text-foreground/60">
        Bend-La Pine Schools Student Voice Council &middot; CTE Scholarship
      </footer>
    </div>
  );
}
