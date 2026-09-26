"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input, Label } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-[var(--coral)]">{error}</p>}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required defaultValue="customer@example.com" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required defaultValue="password123" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-sm text-[var(--text-muted)] text-center">
        New here? <Link href="/register" className="text-[var(--sky)] font-medium">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"CUSTOMER" | "SELLER">("CUSTOMER");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role,
        storeName: form.get("storeName") || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    router.push(role === "SELLER" ? "/seller/dashboard" : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-[var(--coral)]">{error}</p>}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant={role === "CUSTOMER" ? "sky" : "secondary"} onClick={() => setRole("CUSTOMER")}>
          Buyer
        </Button>
        <Button type="button" variant={role === "SELLER" ? "mint" : "secondary"} onClick={() => setRole("SELLER")}>
          Seller
        </Button>
      </div>
      {role === "SELLER" && (
        <div>
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" name="storeName" required />
        </div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
