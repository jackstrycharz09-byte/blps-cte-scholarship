import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  const size = compact ? 40 : 52;
  return (
    <Image
      src="/scholarship-logo.png"
      alt="School to Career Readiness Scholarship"
      width={size}
      height={size}
      className="shrink-0 rounded-full"
      priority
    />
  );
}
