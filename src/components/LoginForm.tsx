"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/login/actions";
import { Card, Field, TextInput, Button, FieldError } from "./ui";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <Card className="max-w-sm mx-auto">
      <form action={formAction} className="space-y-4">
        <Field label="Email" htmlFor="email" required>
          <TextInput id="email" name="email" type="email" required />
        </Field>
        <Field label="Password" htmlFor="password" required>
          <TextInput id="password" name="password" type="password" required />
        </Field>
        <FieldError message={error} />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}
