import { Suspense } from "react";
import { signIn } from "@/lib/admin/actions/auth";
import { buttonClass, Field, Input } from "@/components/admin/ui";

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center">
          <span className="block text-[2.6rem] leading-none" style={{ fontFamily: 'var(--font-script), "Great Vibes", cursive' }}>
            The Day
          </span>
          <span className="mt-1 block text-[0.7rem] font-medium tracking-[0.25em] text-[#8a7f75] uppercase">Admin</span>
        </p>
        <Suspense fallback={null}>
          <LoginForm {...props} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginForm({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  return (
    <form action={signIn} className="space-y-4 rounded-2xl border border-[#e7dccb] bg-white p-6 shadow-[0_1px_2px_rgba(60,40,20,0.05)]">
      <h1 className="text-lg font-semibold">Sign in</h1>
      <Field label="Email">
        <Input name="email" type="email" required autoComplete="username" />
      </Field>
      <Field label="Password">
        <Input name="password" type="password" required autoComplete="current-password" />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-[#a3392f]">
          {error === "forbidden" ? "This account is not an admin." : "Incorrect email or password."}
        </p>
      )}
      <button className={`${buttonClass.primary} w-full py-2.5`}>Sign in</button>
    </form>
  );
}
