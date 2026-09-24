"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction, registerAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormError } from "@/components/ui/Form";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="cta" size="lg" className="w-full" disabled={pending}>
      {pending ? "Please wait…" : label}
    </Button>
  );
}

export function LoginForm({ next = "/" }: { next?: string }) {
  const [state, action] = useActionState(loginAction, {} as ActionState);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <FormError message={state.error} />
      <Submit label="Sign in" />
      <p className="text-sm text-mh-muted text-center">
        New to Lixazon?{" "}
        <Link href="/register" className="text-mh-link hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ defaultRole = "CUSTOMER" }: { defaultRole?: string }) {
  const [state, action] = useActionState(registerAction, {} as ActionState);
  const [role, setRole] = useState(defaultRole);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label>Account type</Label>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="CUSTOMER"
              checked={role === "CUSTOMER"}
              onChange={() => setRole("CUSTOMER")}
            />
            Customer
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="SELLER"
              checked={role === "SELLER"}
              onChange={() => setRole("SELLER")}
            />
            Seller
          </label>
        </div>
      </div>
      {role === "SELLER" && (
        <div>
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" name="storeName" required placeholder="Your store name" />
        </div>
      )}
      <FormError message={state.error} />
      <Submit label="Create account" />
      <p className="text-sm text-mh-muted text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-mh-link hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
