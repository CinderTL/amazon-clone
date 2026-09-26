import { requireAuth } from "@/lib/auth";
import { PasswordForm } from "@/components/AccountForms";

export default async function SettingsPage() {
  await requireAuth();
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-heading text-3xl font-extrabold mb-6">Settings</h1>
      <PasswordForm />
    </div>
  );
}
