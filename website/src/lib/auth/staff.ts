import { cookies } from "next/headers";
import { findStaff, getStaffById } from "@/lib/store/db";
import type { StaffUser, UserRole } from "@/types/domain";

const COOKIE = "mistnleaf_staff";

export async function loginStaff(email: string, password: string) {
  const user = findStaff(email, password);
  if (!user) return null;
  const jar = await cookies();
  jar.set(COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return user;
}

export async function logoutStaff() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCurrentStaff(): Promise<StaffUser | null> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  return getStaffById(id);
}

export function canAccess(role: UserRole, area: string) {
  if (role === "management") return true;
  if (role === "front_desk") {
    return ["dashboard", "guests", "bookings", "rooms", "payments", "offers"].includes(area);
  }
  if (role === "housekeeping") {
    return ["dashboard", "housekeeping", "rooms"].includes(area);
  }
  return false;
}
