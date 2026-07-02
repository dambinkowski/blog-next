import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for use on the SERVER (Server Components, Server Actions,
// Route Handlers). It reads the session from cookies on each request.
// cookies() is async in Next.js 16, so this helper must be async too.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // Supabase reads the current session from these cookies.
        getAll() {
          return cookieStore.getAll();
        },
        // Supabase writes refreshed session cookies back here.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // A Server Component cannot set cookies. That's fine here —
            // our middleware (Step 7) will refresh the session instead.
          }
        },
      },
    }
  );
}
