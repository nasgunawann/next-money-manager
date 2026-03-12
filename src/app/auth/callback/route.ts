import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const errorParam = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (errorParam) {
    const message = errorDescription || "OAuth gagal. Silakan coba lagi.";
    console.error("OAuth error", { error: errorParam, errorDescription });
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(message)}`
    );
  }

  if (code) {
    const response = NextResponse.redirect(`${requestUrl.origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }

    console.error("OAuth exchange failed", { error });
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(
        "Gagal memproses login. Coba lagi."
      )}`
    );
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
