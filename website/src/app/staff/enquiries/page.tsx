import { redirect } from "next/navigation";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { db } from "@/lib/store/db";

export default async function StaffEnquiriesPage() {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "guests")) redirect("/staff?denied=1");
  const enquiries = db().enquiries;

  return (
    <div>
      <h1 className="font-display text-3xl text-[#1f332b]">Enquiries</h1>
      <p className="mt-2 text-sm text-[#667069]">
        Messages submitted from the public Contact & Enquiries form.
      </p>
      <div className="mt-8 space-y-4">
        {enquiries.length === 0 ? (
          <div className="border border-[#d7dbd6] bg-white px-5 py-10 text-center text-sm text-[#667069]">
            No enquiries yet. New submissions from /contact appear here.
          </div>
        ) : null}
        {enquiries.map((item) => (
          <article key={item.id} className="border border-[#d7dbd6] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#667069]">
              {item.id} · {item.status}
            </p>
            <p className="mt-1 font-display text-2xl text-[#1f332b]">
              {item.subject}
            </p>
            <p className="mt-2 text-sm text-[#667069]">
              {item.name} · {item.email} · {item.phone}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#152019]">
              {item.message}
            </p>
            <p className="mt-3 text-xs text-[#667069]">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
