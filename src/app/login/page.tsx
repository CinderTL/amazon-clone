import { LoginForm } from "@/components/AuthForms";

export const metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            Lixa<span className="text-mh-brand">zon</span>
          </h1>
          <p className="text-mh-muted text-sm mt-1">Sign in to your account</p>
        </div>
        <div className="bg-white border border-mh-border rounded-lg p-6">
          <LoginForm next={next || "/"} />
        </div>
        <div className="mt-4 p-3 bg-mh-soft border border-mh-border rounded-lg text-xs text-mh-muted">
          <p className="font-medium text-mh-text mb-1">Demo accounts</p>
          <p>customer@example.com / password123</p>
          <p>seller@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}
