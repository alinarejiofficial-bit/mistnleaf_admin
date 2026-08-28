export type ReservationStatus =
  | "Confirmed"
  | "Checked-in"
  | "Pending"
  | "Cancelled"
  | "Checked-out";

export type Reservation = {
  id: string;
  guest: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  amount: number;
};

/** 5.1 Dashboard summary card metrics */
export const dashboardSummary = {
  totalRooms: 24,
  availableRooms: 5,
  occupiedRooms: 14,
  reservedRooms: 3,
  cleaningRequired: 4,
  maintenanceRooms: 2,
  todaysCheckIns: 7,
  todaysCheckOuts: 5,
  currentGuests: 28,
  pendingReservations: 6,
  todaysRevenue: 82400,
  monthlyRevenue: 1864500,
};

/** 5.2 Occupancy overview (inventory counts + occupancy %) */
export const occupancyOverview = {
  occupancyPercent: 67,
  available: 5,
  occupied: 14,
  reserved: 3,
  outOfOrder: 2,
  totalInventory: 24,
};

/** 5.3 Booking overview */
export const bookingOverview = {
  todaysBookings: 9,
  upcomingBookings: 18,
  pendingBookings: 6,
  confirmedBookings: 22,
  cancelledBookings: 3,
  completedStays: 41,
};

export type RevenuePeriod = "today" | "weekly" | "monthly";

export type RevenueFilterData = {
  label: string;
  total: number;
  byRoomType: { label: string; amount: number }[];
  byBookingSource: { label: string; amount: number }[];
  onlinePayments: number;
  offlinePayments: number;
};

/** 5.4 Revenue overview — filterable by period */
export const revenueByPeriod: Record<RevenuePeriod, RevenueFilterData> = {
  today: {
    label: "Today",
    total: 82400,
    byRoomType: [
      { label: "Leaf Suite", amount: 28600 },
      { label: "Garden Deluxe", amount: 21400 },
      { label: "Canopy King", amount: 17600 },
      { label: "Mist Twin", amount: 14800 },
    ],
    byBookingSource: [
      { label: "Direct website", amount: 32800 },
      { label: "OTA / Booking.com", amount: 22900 },
      { label: "Walk-in", amount: 12600 },
      { label: "Travel agent", amount: 14100 },
    ],
    onlinePayments: 55200,
    offlinePayments: 27200,
  },
  weekly: {
    label: "This week",
    total: 368900,
    byRoomType: [
      { label: "Leaf Suite", amount: 121200 },
      { label: "Garden Deluxe", amount: 95800 },
      { label: "Canopy King", amount: 78800 },
      { label: "Mist Twin", amount: 73100 },
    ],
    byBookingSource: [
      { label: "Direct website", amount: 146900 },
      { label: "OTA / Booking.com", amount: 102600 },
      { label: "Walk-in", amount: 56600 },
      { label: "Travel agent", amount: 62800 },
    ],
    onlinePayments: 247000,
    offlinePayments: 121900,
  },
  monthly: {
    label: "This month",
    total: 1864500,
    byRoomType: [
      { label: "Leaf Suite", amount: 612000 },
      { label: "Garden Deluxe", amount: 484500 },
      { label: "Canopy King", amount: 398000 },
      { label: "Mist Twin", amount: 370000 },
    ],
    byBookingSource: [
      { label: "Direct website", amount: 742000 },
      { label: "OTA / Booking.com", amount: 518500 },
      { label: "Walk-in", amount: 286000 },
      { label: "Travel agent", amount: 318000 },
    ],
    onlinePayments: 1248800,
    offlinePayments: 615700,
  },
};

/** @deprecated Use revenueByPeriod */
export const revenueOverview = {
  today: revenueByPeriod.today.total,
  weekly: revenueByPeriod.weekly.total,
  monthly: revenueByPeriod.monthly.total,
  byRoomType: revenueByPeriod.monthly.byRoomType,
  byBookingSource: revenueByPeriod.monthly.byBookingSource,
  onlinePayments: revenueByPeriod.monthly.onlinePayments,
  offlinePayments: revenueByPeriod.monthly.offlinePayments,
};

export const analyticsSeries = [
  { day: "Mon", bookings: 12, revenue: 42000 },
  { day: "Tue", bookings: 9, revenue: 31000 },
  { day: "Wed", bookings: 15, revenue: 52000 },
  { day: "Thu", bookings: 11, revenue: 44500 },
  { day: "Fri", bookings: 18, revenue: 68000 },
  { day: "Sat", bookings: 22, revenue: 82400 },
  { day: "Sun", bookings: 14, revenue: 51000 },
];

export const upcomingReservations: Reservation[] = [
  {
    id: "RSV-2041",
    guest: "Ananya Sharma",
    room: "Leaf Suite 12",
    checkIn: "2026-08-20",
    checkOut: "2026-08-23",
    status: "Confirmed",
    amount: 18600,
  },
  {
    id: "RSV-2042",
    guest: "Rahul Mehta",
    room: "Mist Twin 04",
    checkIn: "2026-08-20",
    checkOut: "2026-08-22",
    status: "Pending",
    amount: 9800,
  },
  {
    id: "RSV-2038",
    guest: "Priya Nair",
    room: "Garden Deluxe 08",
    checkIn: "2026-08-19",
    checkOut: "2026-08-24",
    status: "Checked-in",
    amount: 27400,
  },
  {
    id: "RSV-2045",
    guest: "James Carter",
    room: "Canopy King 21",
    checkIn: "2026-08-21",
    checkOut: "2026-08-25",
    status: "Confirmed",
    amount: 31200,
  },
  {
    id: "RSV-2033",
    guest: "Meera Iyer",
    room: "Leaf Suite 03",
    checkIn: "2026-08-18",
    checkOut: "2026-08-20",
    status: "Checked-out",
    amount: 15400,
  },
];

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDisplayDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
