import { RegisterForm } from "@/components/AuthForms";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="lx-card p-6 md:p-8">
        <h1 className="font-heading text-2xl font-extrabold">Create your Lixazon account</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1 mb-6">Buy or sell—pick a role to get started.</p>
        <RegisterForm />
      </div>
    </div>
  );
}
