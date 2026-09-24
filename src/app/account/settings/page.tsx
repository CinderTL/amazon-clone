import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PasswordForm } from "@/components/AccountForms";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/settings");

  return (
    <div className="w-full px-4 py-6">
      <nav className="text-xs text-mh-muted mb-3">
        <Link href="/account" className="text-mh-link hover:underline">
          Your Account
        </Link>
        {" › "}
        <span>Settings</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-white border border-mh-border rounded-lg p-6">
        <h2 className="font-bold mb-3">Change password</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
