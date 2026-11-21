import { Suspense } from "react";
import { signIn } from "../actions";

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <main className="mx-auto grid min-h-svh w-full max-w-sm place-items-center px-4">
      <Suspense fallback={null}>
        <LoginForm {...props} />
      </Suspense>
    </main>
  );
}

async function LoginForm({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  const input = "mt-1 block w-full border border-navy/40 bg-white/70 px-3 py-2 outline-none focus:border-gold";
  return (
    <form action={signIn} className="paper frame-double w-full space-y-4 p-8 text-navy">
      <h1 className="foil font-display text-3xl font-semibold">Admin</h1>
      <label className="label-caps block">
        Email
        <input name="email" type="email" required autoComplete="username" className={input} />
      </label>
      <label className="label-caps block">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={input} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error === "forbidden" ? "This account is not an admin." : "Incorrect email or password."}
        </p>
      )}
      <button className="label-caps w-full border border-navy bg-navy px-6 py-2.5 text-ivory">Sign in</button>
    </form>
  );
}
