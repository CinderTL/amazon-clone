import { requireSeller } from "@/lib/auth";
import { SellerShell } from "@/components/SellerNav";
import { PasswordForm, ProfileForm } from "@/components/AccountForms";

export const metadata = { title: "Seller Settings" };

export default async function SellerSettingsPage() {
  const { user } = await requireSeller();

  return (
    <SellerShell current="/seller/settings" title="Settings">
      <div className="space-y-4">
        <div className="lx-card p-4">
          <h2 className="font-bold mb-3">Account profile</h2>
          <ProfileForm user={{ name: user.name, email: user.email, phone: user.phone, themePref: user.themePref }} />
        </div>
        <div className="lx-card p-4">
          <h2 className="font-bold mb-3">Change password</h2>
          <PasswordForm />
        </div>
      </div>
    </SellerShell>
  );
}
