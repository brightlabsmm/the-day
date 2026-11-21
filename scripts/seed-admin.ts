/**
 * Creates (or resets) a LOCAL admin user for development and adds it to
 * admin_users. Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD in
 * .env.local; never use this against a hosted project.
 *
 *   pnpm seed:admin
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!url || !key || !email || !password) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");
  }
  if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(url)) throw new Error("seed:admin only runs against local Supabase");

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: list, error: listErr } = await db.auth.admin.listUsers({ perPage: 200 });
  if (listErr) throw listErr;
  let user = list.users.find((u) => u.email === email);
  if (user) {
    const { error } = await db.auth.admin.updateUserById(user.id, { password });
    if (error) throw error;
  } else {
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw error;
    user = data.user;
  }
  const { error } = await db.from("admin_users").upsert({ user_id: user.id, role: "owner" });
  if (error) throw error;
  console.log(`✓ admin ${email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
