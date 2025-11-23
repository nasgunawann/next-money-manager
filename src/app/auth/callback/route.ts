import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    // In a real SSR app, we would exchange the code for a session here.
    // Since we are using client-side auth primarily for V1 (as per plan to use standard client),
    // we might rely on the client to handle the session.
    // However, Supabase Auth usually needs this callback to exchange code.
    // Let's redirect to a client-side page that handles the exchange if needed,
    // or just redirect to dashboard and let the client SDK pick up the session from the URL fragment if implicit,
    // but PKCE (default) uses code.

    // For now, we just redirect to dashboard.
    // If we need proper SSR auth, we should install @supabase/ssr.
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
