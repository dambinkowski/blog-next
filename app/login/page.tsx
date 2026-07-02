"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  // Same wiring as the register page: useActionState connects the form to
  // the Server Action and exposes the returned error state + pending flag.
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-4 text-xl font-semibold">Log in</h1>

      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="border p-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="border p-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="border bg-black p-2 text-white disabled:opacity-50"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      {state.error && <p className="mt-3 text-red-600">{state.error}</p>}

      <p className="mt-4 text-sm">
        No account yet?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </p>
    </main>
  );
}
