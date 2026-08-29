"use server";

import { redirect } from "next/navigation";
import {
  availableUnitsForType,
  completeCheckout,
  createBooking,
  db,
  modifyBookingDates,
  recordPayment,
  setHousekeeping,
  updateBookingStatus,
} from "@/lib/store/db";
import { getCurrentStaff, loginStaff, logoutStaff } from "@/lib/auth/staff";
import type { BookingStatus, HousekeepingStatus } from "@/types/domain";

export async function staffLoginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const user = await loginStaff(email, password);
  if (!user) redirect("/staff/login?error=1");
  redirect("/staff");
}

export async function staffLogoutAction() {
  await logoutStaff();
  redirect("/staff/login");
}

export async function requireStaff(area?: string) {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (area) {
    const { canAccess } = await import("@/lib/auth/staff");
    if (!canAccess(user.role, area)) redirect("/staff?denied=1");
  }
  return user;
}

export async function checkInAction(formData: FormData) {
  await requireStaff("bookings");
  const bookingId = String(formData.get("bookingId"));
  const store = db();
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking || booking.status !== "confirmed") {
    redirect("/staff/bookings?error=checkin");
  }
  updateBookingStatus(bookingId, "checked_in");
  redirect("/staff/bookings");
}

export async function checkOutAction(formData: FormData) {
  await requireStaff("bookings");
  const bookingId = String(formData.get("bookingId"));
  redirect(`/staff/bookings/${bookingId}/checkout`);
}

export async function completeCheckoutAction(formData: FormData) {
  await requireStaff("bookings");
  const bookingId = String(formData.get("bookingId"));
  const method = String(formData.get("method") || "cash") as
    | "cash"
    | "card"
    | "upi"
    | "bank";
  try {
    const { invoice } = completeCheckout({ bookingId, method });
    redirect(
      `/staff/bookings/${bookingId}/checkout?done=1&invoice=${invoice?.number ?? ""}`,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    redirect(`/staff/bookings/${bookingId}/checkout?error=1`);
  }
}

export async function cancelBookingAction(formData: FormData) {
  await requireStaff("bookings");
  updateBookingStatus(String(formData.get("bookingId")), "cancelled");
  redirect("/staff/bookings");
}

export async function modifyDatesAction(formData: FormData) {
  await requireStaff("bookings");
  try {
    modifyBookingDates(
      String(formData.get("bookingId")),
      String(formData.get("checkIn")),
      String(formData.get("checkOut")),
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    redirect("/staff/bookings?error=conflict");
  }
  redirect("/staff/bookings");
}

export async function housekeepingAction(formData: FormData) {
  await requireStaff("housekeeping");
  setHousekeeping(
    String(formData.get("unitId")),
    String(formData.get("status")) as HousekeepingStatus,
  );
  redirect("/staff/housekeeping");
}

export async function staffRecordPaymentAction(formData: FormData) {
  await requireStaff("payments");
  recordPayment({
    bookingId: String(formData.get("bookingId")),
    amount: Number(formData.get("amount") || 0),
    method: String(formData.get("method") || "cash") as
      | "cash"
      | "card"
      | "upi"
      | "bank",
  });
  const returnTo = String(formData.get("returnTo") || "");
  if (returnTo) redirect(returnTo);
  redirect("/staff/payments");
}

export async function toggleOfferAction(formData: FormData) {
  await requireStaff("offers");
  const store = db();
  const offer = store.offers.find((o) => o.id === String(formData.get("offerId")));
  if (offer) offer.active = !offer.active;
  redirect("/staff/offers");
}

export async function updateRoomTypeRateAction(formData: FormData) {
  await requireStaff("rooms");
  const store = db();
  const type = store.roomTypes.find(
    (r) => r.id === String(formData.get("roomTypeId")),
  );
  if (type) type.baseRate = Number(formData.get("baseRate") || type.baseRate);
  redirect("/staff/rooms");
}

/** Staff walk-in: availability → guest → room assignment → payment → confirmation */
export async function staffCreateBookingAction(formData: FormData) {
  await requireStaff("bookings");

  const roomTypeId = String(formData.get("roomTypeId") || "");
  const roomUnitId = String(formData.get("roomUnitId") || "") || undefined;
  const checkIn = String(formData.get("checkIn") || "");
  const checkOut = String(formData.get("checkOut") || "");
  const adults = Number(formData.get("adults") || 1);
  const children = Number(formData.get("children") || 0);
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const specialRequests = String(formData.get("specialRequests") || "").trim();
  const addonIds = formData.getAll("addonIds").map(String);
  const payNow = String(formData.get("payNow") || "") === "1";
  const method = String(formData.get("method") || "cash") as
    | "cash"
    | "card"
    | "upi"
    | "bank";

  if (!roomTypeId || !checkIn || !checkOut || !fullName || !email || !roomUnitId) {
    redirect("/staff/bookings/new?error=missing");
  }

  const open = availableUnitsForType(roomTypeId, checkIn, checkOut);
  if (!open.some((u) => u.id === roomUnitId)) {
    redirect(
      `/staff/bookings/new?error=unavailable&checkIn=${checkIn}&checkOut=${checkOut}&roomTypeId=${roomTypeId}`,
    );
  }

  try {
    const { booking } = createBooking({
      guest: { fullName, email, phone, address: address || undefined },
      roomTypeId,
      roomUnitId,
      checkIn,
      checkOut,
      adults,
      children,
      addonIds,
      specialRequests: specialRequests || undefined,
    });

    if (payNow) {
      recordPayment({
        bookingId: booking.id,
        amount: booking.total,
        method,
      });
    }

    redirect(
      `/staff/bookings/new?done=1&ref=${booking.reference}&id=${booking.id}`,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    redirect("/staff/bookings/new?error=unavailable");
  }
}

export async function setBookingStatusAction(
  bookingId: string,
  status: BookingStatus,
) {
  await requireStaff("bookings");
  updateBookingStatus(bookingId, status);
}
