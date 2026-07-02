"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Shape of what the action returns to the form (for showing errors).
export type LoginState = { error: string | null };

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // Same rule as register: this is a public POST endpoint, validate on the server.
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  // On success Supabase issues an access token (JWT) + refresh token, and
  // writes them into cookies via our server client's setAll(). From this
  // point every request carries the session.
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Supabase deliberately returns the same "Invalid login credentials"
    // whether the email or the password was wrong (no email enumeration).
    return { error: error.message };
  }

  redirect("/");
}
