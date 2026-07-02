import { createBrowserClient } from "@supabase/ssr";

// Supabase client for use in the BROWSER (Client Components, "use client").
// createBrowserClient handles reading/writing the session cookie for us —
// we deliberately pass no cookie config, because the default is correct.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
