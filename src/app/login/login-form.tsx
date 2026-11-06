"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="username" className="field-label">
          Username
        </label>
        <input id="username" name="username" type="text" autoComplete="username" autoCapitalize="none" required className="field-input" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field-input" />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
