import {
  addons as seedAddons,
  bookings as seedBookings,
  guests as seedGuests,
  invoices as seedInvoices,
  offers as seedOffers,
  payments as seedPayments,
  roomTypes as seedRoomTypes,
  roomUnits as seedRoomUnits,
  staffUsers,
} from "@/lib/store/seed";
import type {
  Addon,
  Booking,
  BookingStatus,
  Enquiry,
  Guest,
  HousekeepingStatus,
  Invoice,
  Offer,
  PaymentRecord,
  RoomType,
  RoomUnit,
  StaffUser,
} from "@/types/domain";

type Db = {
  guests: Guest[];
  roomTypes: RoomType[];
  roomUnits: RoomUnit[];
  bookings: Booking[];
  payments: PaymentRecord[];
  invoices: Invoice[];
  offers: Offer[];
  addons: Addon[];
  enquiries: Enquiry[];
};

const globalStore = globalThis as unknown as { __mistnleafDb?: Db };

function createDb(): Db {
  return {
    guests: structuredClone(seedGuests),
    roomTypes: structuredClone(seedRoomTypes),
    roomUnits: structuredClone(seedRoomUnits),
    bookings: structuredClone(seedBookings),
    payments: structuredClone(seedPayments),
    invoices: structuredClone(seedInvoices),
    offers: structuredClone(seedOffers),
    addons: structuredClone(seedAddons),
    enquiries: [],
  };
}

export function db(): Db {
  if (!globalStore.__mistnleafDb) {
    globalStore.__mistnleafDb = createDb();
  }
  if (!globalStore.__mistnleafDb.enquiries) {
    globalStore.__mistnleafDb.enquiries = [];
  }
  return globalStore.__mistnleafDb;
}

export function resetDb() {
  globalStore.__mistnleafDb = createDb();
}

export function findStaff(email: string, password: string): StaffUser | null {
  return (
    staffUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    ) ?? null
  );
}

export function getStaffById(id: string) {
  return staffUsers.find((u) => u.id === id) ?? null;
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/** Prevent double bookings for a concrete room unit over date range. */
export function isUnitAvailable(
  roomUnitId: string,
  checkIn: string,
  checkOut: string,
  ignoreBookingId?: string,
) {
  const store = db();
  return !store.bookings.some((b) => {
    if (ignoreBookingId && b.id === ignoreBookingId) return false;
    if (b.roomUnitId !== roomUnitId) return false;
    if (b.status === "cancelled" || b.status === "checked_out") return false;
    return overlaps(checkIn, checkOut, b.checkIn, b.checkOut);
  });
}

export function availableUnitsForType(
  roomTypeId: string,
  checkIn: string,
  checkOut: string,
) {
  const store = db();
  return store.roomUnits.filter(
    (unit) =>
      unit.roomTypeId === roomTypeId &&
      unit.status !== "maintenance" &&
      isUnitAvailable(unit.id, checkIn, checkOut),
  );
}

export function quoteStay(input: {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  addonIds?: string[];
  offerCode?: string;
}) {
  const store = db();
  const type = store.roomTypes.find((r) => r.id === input.roomTypeId);
  if (!type) throw new Error("Room type not found");
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < 1) throw new Error("Invalid dates");

  const addonTotal = (input.addonIds ?? [])
    .map((id) => store.addons.find((a) => a.id === id && a.active)?.price ?? 0)
    .reduce((s, n) => s + n, 0);

  let subtotal = type.baseRate * nights + addonTotal;
  let discount = 0;
  if (input.offerCode) {
    const offer = store.offers.find(
      (o) => o.code.toLowerCase() === input.offerCode!.toLowerCase() && o.active,
    );
    if (offer) discount = Math.round(subtotal * (offer.discountPercent / 100));
  }
  const taxable = subtotal - discount;
  const taxes = Math.round(taxable * 0.12);
  const total = taxable + taxes;
  return { nights, subtotal, discount, taxes, total, baseRate: type.baseRate };
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function upsertGuest(input: {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
}) {
  const store = db();
  const existing = store.guests.find(
    (g) => g.email.toLowerCase() === input.email.toLowerCase(),
  );
  if (existing) {
    existing.fullName = input.fullName;
    existing.phone = input.phone;
    existing.address = input.address;
    existing.notes = input.notes;
    return existing;
  }
  const guest: Guest = {
    id: uid("g"),
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    address: input.address,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
  store.guests.unshift(guest);
  return guest;
}

export function createBooking(input: {
  guest: { fullName: string; email: string; phone: string; address?: string };
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  addonIds?: string[];
  offerCode?: string;
  specialRequests?: string;
  /** Optional explicit unit assignment (staff walk-ins). */
  roomUnitId?: string;
}) {
  const store = db();
  const units = availableUnitsForType(input.roomTypeId, input.checkIn, input.checkOut);
  if (units.length === 0) {
    throw new Error("No rooms available for selected dates (double-booking prevented).");
  }

  let unit = units[0]!;
  if (input.roomUnitId) {
    const assigned = units.find((u) => u.id === input.roomUnitId);
    if (!assigned) {
      throw new Error("Selected room unit is not available for these dates.");
    }
    unit = assigned;
  }

  const quote = quoteStay({
    roomTypeId: input.roomTypeId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    addonIds: input.addonIds,
    offerCode: input.offerCode,
  });
  const guest = upsertGuest(input.guest);
  const now = new Date().toISOString();
  const booking: Booking = {
    id: uid("b"),
    reference: `ML-${Date.now().toString().slice(-8)}`,
    guestId: guest.id,
    roomTypeId: input.roomTypeId,
    roomUnitId: unit.id,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    children: input.children,
    addonIds: input.addonIds ?? [],
    status: "pending_payment",
    paymentStatus: "unpaid",
    subtotal: quote.subtotal,
    taxes: quote.taxes,
    discount: quote.discount,
    total: quote.total,
    amountPaid: 0,
    specialRequests: input.specialRequests,
    createdAt: now,
    updatedAt: now,
  };
  store.bookings.unshift(booking);
  unit.status = "reserved";
  return { booking, guest, quote };
}

export function recordPayment(input: {
  bookingId: string;
  amount: number;
  method: PaymentRecord["method"];
}) {
  const store = db();
  const booking = store.bookings.find((b) => b.id === input.bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "cancelled") throw new Error("Cannot pay cancelled booking");

  const payment: PaymentRecord = {
    id: uid("p"),
    bookingId: booking.id,
    amount: input.amount,
    method: input.method,
    status: "succeeded",
    createdAt: new Date().toISOString(),
  };
  store.payments.unshift(payment);
  booking.amountPaid += input.amount;
  booking.updatedAt = new Date().toISOString();

  if (booking.amountPaid >= booking.total) {
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
  } else if (booking.amountPaid > 0) {
    booking.paymentStatus = "partial";
  }

  let invoice = store.invoices.find((i) => i.bookingId === booking.id);
  if (!invoice) {
    invoice = {
      id: uid("inv"),
      bookingId: booking.id,
      number: `INV-${booking.reference}`,
      issuedAt: new Date().toISOString(),
      total: booking.total,
      amountPaid: booking.amountPaid,
      balance: Math.max(booking.total - booking.amountPaid, 0),
    };
    store.invoices.unshift(invoice);
  } else {
    invoice.amountPaid = booking.amountPaid;
    invoice.balance = Math.max(booking.total - booking.amountPaid, 0);
  }

  return { booking, payment, invoice };
}

export function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const store = db();
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error("Booking not found");
  booking.status = status;
  booking.updatedAt = new Date().toISOString();

  if (booking.roomUnitId) {
    const unit = store.roomUnits.find((u) => u.id === booking.roomUnitId);
    if (unit) {
      if (status === "checked_in") unit.status = "occupied";
      if (status === "checked_out") {
        unit.status = "dirty";
        unit.housekeeping = "dirty";
      }
      if (status === "cancelled") unit.status = "available";
      if (status === "confirmed") unit.status = "reserved";
    }
  }
  return booking;
}

/** Balance remaining on a booking. */
export function bookingBalance(bookingId: string) {
  const store = db();
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error("Booking not found");
  return Math.max(booking.total - booking.amountPaid, 0);
}

/**
 * Guest checkout pipeline:
 * settle balance if needed → invoice refresh → checked_out → room dirty for cleaning.
 */
export function completeCheckout(input: {
  bookingId: string;
  settleAmount?: number;
  method?: PaymentRecord["method"];
}) {
  const store = db();
  const booking = store.bookings.find((b) => b.id === input.bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "checked_in") {
    throw new Error("Only checked-in guests can be checked out.");
  }

  const balance = Math.max(booking.total - booking.amountPaid, 0);
  let payment = null;
  let invoice =
    store.invoices.find((i) => i.bookingId === booking.id) ?? null;

  if (balance > 0) {
    const amount = input.settleAmount ?? balance;
    if (amount < balance) {
      throw new Error("Outstanding balance must be settled before checkout.");
    }
    const result = recordPayment({
      bookingId: booking.id,
      amount: balance,
      method: input.method ?? "cash",
    });
    payment = result.payment;
    invoice = result.invoice;
  } else if (!invoice) {
    invoice = {
      id: uid("inv"),
      bookingId: booking.id,
      number: `INV-${booking.reference}`,
      issuedAt: new Date().toISOString(),
      total: booking.total,
      amountPaid: booking.amountPaid,
      balance: 0,
    };
    store.invoices.unshift(invoice);
  }

  updateBookingStatus(booking.id, "checked_out");
  return { booking, payment, invoice };
}

export function setHousekeeping(unitId: string, housekeeping: HousekeepingStatus) {
  const store = db();
  const unit = store.roomUnits.find((u) => u.id === unitId);
  if (!unit) throw new Error("Room unit not found");
  unit.housekeeping = housekeeping;
  if (housekeeping === "dirty") unit.status = "dirty";
  if (housekeeping === "in_progress") unit.status = "cleaning";
  // After cleaning/inspection, room returns to sellable inventory.
  if (housekeeping === "clean" || housekeeping === "inspected") {
    if (unit.status === "dirty" || unit.status === "cleaning" || unit.status === "ready") {
      unit.status = "available";
    }
  }
  return unit;
}

export function modifyBookingDates(
  bookingId: string,
  checkIn: string,
  checkOut: string,
) {
  const store = db();
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error("Booking not found");
  if (!booking.roomUnitId) throw new Error("No room assigned");
  if (!isUnitAvailable(booking.roomUnitId, checkIn, checkOut, booking.id)) {
    throw new Error("New dates conflict with another booking.");
  }
  const quote = quoteStay({
    roomTypeId: booking.roomTypeId,
    checkIn,
    checkOut,
    addonIds: booking.addonIds,
  });
  booking.checkIn = checkIn;
  booking.checkOut = checkOut;
  booking.subtotal = quote.subtotal;
  booking.taxes = quote.taxes;
  booking.discount = quote.discount;
  booking.total = quote.total;
  booking.status = "modified";
  booking.updatedAt = new Date().toISOString();
  return booking;
}

export function createEnquiry(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const store = db();
  const enquiry: Enquiry = {
    id: uid("enq"),
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    message: input.message,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  store.enquiries.unshift(enquiry);
  upsertGuest({
    fullName: input.name,
    email: input.email,
    phone: input.phone,
    notes: `Enquiry: ${input.subject}`,
  });
  return enquiry;
}

