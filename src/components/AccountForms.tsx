"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Form";
import { useTheme } from "@/components/ThemeProvider";

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; phone: string | null; themePref: string | null };
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const themePref = String(form.get("themePref") || "light");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone") || null,
        themePref,
      }),
    });
    if (res.ok && (themePref === "light" || themePref === "dark" || themePref === "system")) {
      setTheme(themePref);
    }
    setMessage(res.ok ? "Saved" : "Could not save");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="lx-card p-6 space-y-4 max-w-lg">
      <div>
        <Label>Email</Label>
        <Input value={user.email} disabled />
      </div>
      <div>
        <Label>Name</Label>
        <Input name="name" defaultValue={user.name} required />
      </div>
      <div>
        <Label>Phone</Label>
        <Input name="phone" defaultValue={user.phone || ""} />
      </div>
      <div>
        <Label>Theme preference</Label>
        <Select name="themePref" defaultValue={user.themePref || "light"}>
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
      </div>
      {message && <p className="text-sm text-[var(--foreground)]">{message}</p>}
      <Button type="submit">Save profile</Button>
    </form>
  );
}

export function PasswordForm() {
  const [message, setMessage] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
      }),
    });
    const data = await res.json();
    setMessage(res.ok && !data.error ? "Password updated" : data.error || "Failed");
  }

  return (
    <form onSubmit={onSubmit} className="lx-card p-6 space-y-4 max-w-lg">
      <div>
        <Label>Current password</Label>
        <Input name="currentPassword" type="password" required />
      </div>
      <div>
        <Label>New password</Label>
        <Input name="newPassword" type="password" minLength={8} required />
      </div>
      {message && <p className="text-sm">{message}</p>}
      <Button type="submit" variant="secondary">
        Update password
      </Button>
    </form>
  );
}
