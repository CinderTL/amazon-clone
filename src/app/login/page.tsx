import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="lx-card p-6 md:p-8">
        <h1 className="font-heading text-2xl font-extrabold">Welcome back</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1 mb-6">Sign in to cart, checkout, and orders.</p>
        <Suspense fallback={<p>Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
