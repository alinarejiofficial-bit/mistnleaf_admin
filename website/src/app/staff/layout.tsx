import Link from "next/link";
import { redirect } from "next/navigation";
import { staffLogoutAction } from "@/app/staff/actions";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/staff", label: "Dashboard", area: "dashboard" },
  { href: "/staff/guests", label: "Guests", area: "guests" },
  { href: "/staff/enquiries", label: "Enquiries", area: "guests" },
  { href: "/staff/rooms", label: "Rooms", area: "rooms" },
  { href: "/staff/bookings", label: "Bookings", area: "bookings" },
  { href: "/staff/housekeeping", label: "Housekeeping", area: "housekeeping" },
  { href: "/staff/payments", label: "Payments", area: "payments" },
  { href: "/staff/offers", label: "Offers", area: "offers" },
  { href: "/staff/reports", label: "Reports", area: "reports" },
];

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page uses this layout too — handle in page. For layout we check path via children only.
  // Simpler: layout always shows shell if logged in; login page has its own minimal chrome.
  const user = await getCurrentStaff();

  return (
    <div className="min-h-screen bg-[#f3f4f2] text-[#152019]">
      {user ? (
        <div className="mx-auto grid min-h-screen max-w-7xl md:grid-cols-[220px_1fr]">
          <aside className="border-r border-[#d7dbd6] bg-[#1f332b] text-[#f5f6f4]">
            <div className="px-5 py-6">
              <p className="font-display text-2xl">Mistnleaf</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/50">
                Operations
              </p>
            </div>
            <nav className="flex flex-col gap-1 px-3 pb-6">
              {nav
                .filter((item) => canAccess(user.role, item.area))
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-sm px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              <Link
                href="/"
                className="mt-4 px-3 py-2 text-xs text-white/45 hover:text-white"
              >
                ← Customer site
              </Link>
            </nav>
            <div className="mt-auto border-t border-white/10 px-5 py-4 text-sm">
              <p className="text-white/90">{user.name}</p>
              <p className="text-xs capitalize text-white/45">{user.role.replace("_", " ")}</p>
              <form action={staffLogoutAction} className="mt-3">
                <button type="submit" className="text-xs text-white/60 hover:text-white">
                  Sign out
                </button>
              </form>
            </div>
          </aside>
          <div className="min-w-0">
            <header className="flex items-center justify-between border-b border-[#d7dbd6] bg-white px-6 py-4">
              <p className="text-sm text-[#667069]">Staff console · demo data store</p>
              <span
                className={cn(
                  "text-xs uppercase tracking-[0.14em]",
                  "text-[#1f332b]",
                )}
              >
                Role-based access
              </span>
            </header>
            <div className="p-6 md:p-8">{children}</div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export async function guardStaffArea(area: string) {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, area)) redirect("/staff?denied=1");
  return user;
}
