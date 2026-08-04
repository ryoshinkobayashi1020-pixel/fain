import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const setupRequired = request.cookies.get("admin_setup_required")?.value === "1";
  const isSettingsPage = request.nextUrl.pathname.startsWith("/admin/settings");

  if (setupRequired && !isSettingsPage) {
    return NextResponse.redirect(new URL("/admin/settings?first=1", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
