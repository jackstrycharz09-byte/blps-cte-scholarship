import { Logo } from "./Logo";

export function Header({
  title,
  subtitle,
  minimal = false,
  wide = false,
  right,
}: {
  title: string;
  subtitle?: string;
  minimal?: boolean;
  wide?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <header className="bg-maroon text-cream">
      <div
        className={`mx-auto flex items-center gap-4 px-4 sm:px-6 ${wide ? "max-w-6xl" : "max-w-4xl"} ${
          minimal ? "py-4" : "py-6"
        }`}
      >
        <Logo compact={minimal} />
        <div className="min-w-0 flex-1">
          <h1
            className={`font-heading font-bold leading-tight ${
              minimal ? "text-lg" : "text-xl sm:text-2xl"
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-cream/85 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0 text-sm">{right}</div>}
      </div>
    </header>
  );
}
