export type UserRole = "management" | "front_desk" | "housekeeping";

export type RoomStatus = "available" | "occupied" | "reserved" | "maintenance" | "dirty" | "cleaning" | "ready";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "modified";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export type HousekeepingStatus = "clean" | "dirty" | "in_progress" | "inspected";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string; // demo only
};

export type Guest = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
};

export type RoomType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  maxGuests: number;
  beds: string;
  baseRate: number;
  amenities: string[];
  image: string;
};

export type RoomUnit = {
  id: string;
  code: string;
  roomTypeId: string;
  floor: string;
  status: RoomStatus;
  housekeeping: HousekeepingStatus;
};

export type Booking = {
  id: string;
  reference: string;
  guestId: string;
  roomTypeId: string;
  roomUnitId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  addonIds: string[];
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  amountPaid: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  bookingId: string;
  amount: number;
  method: "card" | "upi" | "cash" | "bank";
  status: "succeeded" | "pending" | "failed" | "refunded";
  createdAt: string;
  note?: string;
};

export type Invoice = {
  id: string;
  bookingId: string;
  number: string;
  issuedAt: string;
  total: number;
  amountPaid: number;
  balance: number;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  code: string;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "new" | "reviewed";
};

export type Addon = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};
