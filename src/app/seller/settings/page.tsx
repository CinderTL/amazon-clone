import { requireSeller } from "@/lib/auth";
import { SellerShell } from "@/components/SellerNav";
import { PasswordForm, ProfileForm } from "@/components/AccountForms";

export const metadata = { title: "Seller Settings" };

export default async function SellerSettingsPage() {
  const { user } = await requireSeller();

  return (
    <SellerShell current="/seller/settings" title="Settings">
      <div className="space-y-4">
        <div className="bg-white border border-mh-border rounded-lg p-4">
          <h2 className="font-bold mb-3">Account profile</h2>
          <ProfileForm name={user.name} email={user.email} phone={user.phone || ""} />
        </div>
        <div className="bg-white border border-mh-border rounded-lg p-4">
          <h2 className="font-bold mb-3">Change password</h2>
          <PasswordForm />
        </div>
      </div>
    </SellerShell>
  );
}
