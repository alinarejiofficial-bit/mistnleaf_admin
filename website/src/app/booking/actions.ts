"use server";

import { redirect } from "next/navigation";
import {
  getRoom,
  nightsBetween,
  parseAddonIds,
  requireGuest,
  requireRoom,
  requireSearch,
  roomSlugToTypeId,
  toQuery,
  parseBookingQuery,
} from "@/lib/booking";

function fromForm(formData: FormData) {
  const entries = [...formData.entries()]
    .filter(([k]) => k !== "addonIds" && k !== "addonsStep")
    .map(([k, v]) => [k, String(v)]);
  const parsed = parseBookingQuery(Object.fromEntries(entries));
  // Add-ons step always posts `addonsStep=1` so empty selections clear prior choices.
  if (formData.get("addonsStep") === "1") {
    parsed.addons = formData.getAll("addonIds").map(String).join(",");
  }
  return parsed;
}

export async function goToAvailability(formData: FormData) {
  const query = fromForm(formData);
  if (!requireSearch(query)) {
    redirect("/booking/search?error=dates");
  }
  redirect(`/booking/availability?${toQuery(query)}`);
}

export async function goToSelect(formData: FormData) {
  const query = fromForm(formData);
  if (!requireSearch(query)) {
    redirect("/booking/search");
  }
  redirect(`/booking/select?${toQuery(query)}`);
}

export async function goToAddons(formData: FormData) {
  const query = fromForm(formData);
  if (!requireRoom(query)) {
    redirect(`/booking/select?${toQuery(query)}`);
  }
  redirect(`/booking/add-ons?${toQuery(query)}`);
}

export async function goToSummary(formData: FormData) {
  const query = fromForm(formData);
  if (!requireGuest(query)) {
    redirect(`/booking/guest?${toQuery(query)}&error=guest`);
  }
  redirect(`/booking/summary?${toQuery(query)}`);
}

export async function goToGuest(formData: FormData) {
  const query = fromForm(formData);
  if (!requireRoom(query)) {
    redirect(`/booking/select?${toQuery(query)}`);
  }
  redirect(`/booking/guest?${toQuery(query)}`);
}

export async function goToPayment(formData: FormData) {
  const query = fromForm(formData);
  if (!requireGuest(query)) {
    redirect(`/booking/guest?${toQuery(query)}&error=guest`);
  }
  redirect(`/booking/payment?${toQuery(query)}`);
}

export async function completePayment(formData: FormData) {
  const query = fromForm(formData);
  if (!requireGuest(query)) {
    redirect("/booking/search");
  }

  const room = getRoom(query.room);
  const nights = nightsBetween(query.checkIn, query.checkOut);
  if (!room || nights < 1) {
    redirect("/booking/search");
  }

  const roomTypeId = roomSlugToTypeId[query.room];
  if (!roomTypeId) {
    redirect("/booking/search");
  }

  const guests = Number(query.guests) || 2;
  const addonIds = parseAddonIds(query.addons);

  try {
    const { createBooking, recordPayment } = await import("@/lib/store/db");
    const { booking } = createBooking({
      guest: {
        fullName: query.name,
        email: query.email,
        phone: query.phone,
        address: undefined,
      },
      roomTypeId,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      adults: guests,
      children: 0,
      addonIds,
      specialRequests: query.notes,
    });

    recordPayment({
      bookingId: booking.id,
      amount: booking.total,
      method: "card",
    });

    redirect(
      `/booking/confirmation?${toQuery({
        ...query,
        ref: booking.reference,
        room: room.name,
        id: booking.id,
      })}`,
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
    redirect(`/booking/availability?${toQuery(query)}&error=unavailable`);
  }
}
