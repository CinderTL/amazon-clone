import { RegisterForm } from "@/components/AuthForms";

export const metadata = { title: "Create account" };

type Props = { searchParams: Promise<{ role?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { role } = await searchParams;
  const defaultRole = role === "SELLER" ? "SELLER" : "CUSTOMER";
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            Lixa<span className="text-mh-brand">zon</span>
          </h1>
          <p className="text-mh-muted text-sm mt-1">Create your account</p>
        </div>
        <div className="bg-white border border-mh-border rounded-lg p-6">
          <RegisterForm defaultRole={defaultRole} />
        </div>
      </div>
    </div>
  );
}
