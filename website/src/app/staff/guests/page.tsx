import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { db } from "@/lib/store/db";

export default async function StaffGuestsPage() {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "guests")) redirect("/staff?denied=1");
  const guests = db().guests;

  return (
    <div>
      <h1 className="font-display text-3xl text-[#1f332b]">Guest database</h1>
      <p className="mt-2 text-sm text-[#667069]">
        Centralized guest profiles created from bookings and front-desk intake.
      </p>
      <div className="mt-8 overflow-x-auto border border-[#d7dbd6] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#d7dbd6] bg-[#f3f4f2] text-xs uppercase tracking-[0.12em] text-[#667069]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id} className="border-b border-[#d7dbd6]/70">
                <td className="px-4 py-3 font-medium">{g.fullName}</td>
                <td className="px-4 py-3">{g.email}</td>
                <td className="px-4 py-3">{g.phone}</td>
                <td className="px-4 py-3">{g.address || "—"}</td>
                <td className="px-4 py-3">{new Date(g.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {guests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#667069]">
                  No guests yet. New bookings populate this database automatically.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Link href="/staff" className="mt-6 inline-block text-sm text-[#1f332b]">
        ← Dashboard
      </Link>
    </div>
  );
}
