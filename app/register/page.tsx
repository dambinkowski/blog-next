"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type RegisterState } from "./actions";

const initialState: RegisterState = { error: null };

export default function RegisterPage() {
  // useActionState wires the form to the Server Action and gives us back
  // the latest returned state and a `pending` flag while it runs.
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-4 text-xl font-semibold">Create an account</h1>

      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="username"
          placeholder="Name"
          required
          className="border p-2"
        />
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
          minLength={6}
          className="border p-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="border bg-black p-2 text-white disabled:opacity-50"
        >
          {pending ? "Creating…" : "Register"}
        </button>
      </form>

      {state.error && <p className="mt-3 text-red-600">{state.error}</p>}

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
