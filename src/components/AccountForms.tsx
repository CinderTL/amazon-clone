"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfileAction, changePasswordAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormError, FormSuccess } from "@/components/ui/Form";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="cta" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, action] = useActionState(updateProfileAction, {} as ActionState);
  return (
    <form action={action} className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" defaultValue={email} disabled />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={phone} />
      </div>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <Submit label="Save changes" />
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, {} as ActionState);
  return (
    <form action={action} className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
      </div>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <Submit label="Update password" />
    </form>
  );
}
