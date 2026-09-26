import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <div className="flex w-full flex-1 items-start justify-center px-4 py-6 md:items-center md:overflow-y-auto md:py-4">
      <div className="lx-card w-full max-w-md p-6 md:p-8">
        <h1 className="font-heading text-2xl font-extrabold">Welcome back</h1>
        <p className="mb-6 mt-1 text-sm text-[var(--muted)]">Sign in to cart, checkout, and orders.</p>
        <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
