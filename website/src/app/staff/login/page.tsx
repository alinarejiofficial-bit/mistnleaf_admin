import Link from "next/link";
import { staffLoginAction } from "@/app/staff/actions";
import { getCurrentStaff } from "@/lib/auth/staff";
import { redirect } from "next/navigation";

type Props = PageProps<"/staff/login">;

export default async function StaffLoginPage({ searchParams }: Props) {
  const user = await getCurrentStaff();
  if (user) redirect("/staff");
  const params = await searchParams;
  const error = typeof params.error === "string";

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md border border-[#d7dbd6] bg-white p-8">
        <p className="font-display text-3xl text-[#1f332b]">Staff sign in</p>
        <p className="mt-2 text-sm text-[#667069]">
          Operations console for Mistnleaf Staycation (demo).
        </p>
        {error ? (
          <p className="mt-4 border border-[#d7dbd6] bg-[#f3f4f2] px-3 py-2 text-sm text-[#1f332b]">
            Invalid email or password.
          </p>
        ) : null}
        <form action={staffLoginAction} className="mt-6 space-y-4">
          <label className="block text-xs uppercase tracking-[0.14em] text-[#667069]">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full border border-[#d7dbd6] px-3 py-2 text-sm"
              defaultValue="manager@mistnleaf.demo"
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#667069]">
            Password
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full border border-[#d7dbd6] px-3 py-2 text-sm"
              defaultValue="manager123"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-[#1f332b] px-4 py-3 text-sm uppercase tracking-[0.08em] text-white"
          >
            Sign in
          </button>
        </form>
        <div className="mt-6 space-y-1 text-xs text-[#667069]">
          <p>Demo accounts:</p>
          <p>manager@mistnleaf.demo / manager123</p>
          <p>frontdesk@mistnleaf.demo / desk123</p>
          <p>housekeeping@mistnleaf.demo / hk123</p>
        </div>
        <Link href="/" className="mt-6 inline-block text-sm text-[#1f332b]">
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
