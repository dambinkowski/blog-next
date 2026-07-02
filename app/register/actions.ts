"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Shape of what the action returns to the form (for showing errors).
export type RegisterState = { error: string | null };

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  // Read + validate the submitted fields. Never trust the client — this
  // action is a POST endpoint anyone can call directly, not just our form.
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !email || !password) {
    return { error: "All fields are required." };
  }

  const supabase = await createClient();

  // Create the auth user. The username is passed as metadata; our DB
  // trigger reads it to build the matching profiles row.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    return { error: error.message };
  }

  // Success: signUp sent a confirmation email. Send the user to /confirm.
  // (redirect() throws internally, so it must be outside any try/catch.)
  redirect("/confirm");
}
