// Next.js 16 renamed Middleware to Proxy; this performs the optimistic
// session-cookie check (via auth.ts's `authorized` callback) that gates
// /dashboard/*. The real, DB-backed check still happens in each dashboard
// server component/route via `auth()`.
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*"],
};
