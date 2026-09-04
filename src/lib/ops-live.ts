import type { AppNotification } from "@/lib/notifications";
import type {
  AddOn,
  CalendarCell,
  Guest,
  HousekeepingTask,
  Invoice,
  MaintenanceTicket,
  Offer,
  Payment,
} from "@/lib/ops-data";
import type { FinanceInvoiceDetail, FinancePayment, FinanceRefund } from "@/lib/finance-data";
import type { AssignedRoom, HousekeepingRoomStatus } from "@/lib/housekeeping-data";
import type {
  BookingSource,
  PaymentStatus,
  Reservation,
  ReservationStatus,
} from "@/lib/reservations";
import type { Room, RoomStatus } from "@/lib/rooms";
import type { RoleId } from "@/lib/roles";
import type { CmsWebsiteOffer, CmsExperience } from "@/lib/cms-data";
import type {
  StaffDirectoryUser,
  StaffMaintenanceTicket,
  StaffReservation,
  StaffRoom,
} from "@/lib/staff-api-client";

export function todayISO(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
}

export function addDaysISO(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

export function mapStaffBooking(item: StaffReservation): Reservation {
  const statusMap: Record<string, ReservationStatus> = {
    Pending: "Pending",
    pending_payment: "Pending",
    Confirmed: "Confirmed",
    "Checked-in": "Checked-in",
    "Checked-out": "Checked-out",
    Cancelled: "Cancelled",
    modified: "Confirmed",
  };
  const sourceMap: Record<string, BookingSource> = {
    "Direct website": "Direct website",
    "OTA / Booking.com": "OTA / Booking.com",
    "Walk-in": "Walk-in",
    "Travel agent": "Travel agent",
  };
  const paymentMap: Record<string, PaymentStatus> = {
    Paid: "Paid",
    Partial: "Partial",
    Pending: "Pending",
    Refunded: "Refunded",
  };

  return {
    id: item.id,
    guest: item.guest,
    email: item.email,
    phone: item.phone,
    room: item.room,
    roomType: item.roomType,
    adults: item.adults,
    children: item.children,
    checkIn: item.checkIn,
    checkOut: item.checkOut,
    nights: item.nights,
    status: statusMap[item.status] ?? "Pending",
    source: sourceMap[item.source] ?? "Direct website",
    paymentStatus: paymentMap[item.paymentStatus] ?? "Pending",
    amount: Number(item.amount) || 0,
    paidAmount: Number(item.paidAmount) || 0,
    notes: item.notes,
  };
}

export function mapStaffRoom(item: StaffRoom): Room {
  const floorNum = Number.parseInt(String(item.floor), 10);
  return {
    id: item.id,
    number: item.number || item.code,
    name: item.display_name || item.name || item.code,
    type: item.type || item.room_type_name,
    floor: Number.isFinite(floorNum) ? floorNum : 1,
    capacity: item.capacity,
    beds: item.beds || "",
    rate: Number(item.rate) || 0,
    sizeSqFt: item.sizeSqFt ?? 0,
    amenities: item.amenities ?? [],
    status: (item.dashboardStatus as RoomStatus) || "Available",
    imageUrl: item.imageUrl || undefined,
    guest: item.guest || undefined,
    reservationId: item.reservationId || undefined,
    notes: item.notes || undefined,
  };
}

export function guestsFromBookings(bookings: Reservation[]): Guest[] {
  const byEmail = new Map<string, Guest>();
  for (const booking of bookings) {
    const key = (booking.email || booking.guest).toLowerCase();
    const existing = byEmail.get(key);
    const spend = booking.status === "Cancelled" ? 0 : booking.paidAmount;
    const lastStay = booking.checkOut;
    if (!existing) {
      byEmail.set(key, {
        id: `GST-${key.slice(0, 8)}`,
        name: booking.guest,
        email: booking.email,
        phone: booking.phone,
        nationality: "",
        stays: booking.status === "Cancelled" ? 0 : 1,
        lastStay,
        totalSpend: spend,
        status: booking.paidAmount > 40000 ? "VIP" : "Active",
        notes: booking.notes,
      });
      continue;
    }
    existing.stays += booking.status === "Cancelled" ? 0 : 1;
    existing.totalSpend += spend;
    if (lastStay > existing.lastStay) existing.lastStay = lastStay;
    if (existing.totalSpend > 40000) existing.status = "VIP";
  }
  return Array.from(byEmail.values());
}

export function paymentsFromBookings(bookings: Reservation[]): Payment[] {
  return bookings.map((booking) => {
    const online = booking.source === "Direct website" || booking.source === "OTA / Booking.com";
    let status: Payment["status"] = "Success";
    if (booking.paymentStatus === "Pending") status = "Pending";
    else if (booking.paymentStatus === "Refunded") status = "Refunded";
    return {
      id: `PAY-${booking.id.replace("RSV-", "")}`,
      guest: booking.guest,
      reservationId: booking.id,
      method: online ? "UPI" : "Cash",
      channel: online ? "Online" : "Offline",
      amount: booking.paidAmount || booking.amount,
      status,
      date: booking.checkIn,
    };
  });
}

export function invoicesFromBookings(bookings: Reservation[], today = todayISO()): Invoice[] {
  return bookings
    .filter((booking) => booking.status !== "Cancelled")
    .map((booking) => {
      let status: Invoice["status"] = "Unpaid";
      if (booking.paymentStatus === "Paid") status = "Paid";
      else if (booking.paymentStatus === "Pending") status = "Draft";
      else if (booking.checkOut < today) status = "Overdue";
      return {
        id: `INV-${booking.id.replace("RSV-", "")}`,
        guest: booking.guest,
        reservationId: booking.id,
        issuedOn: booking.checkIn,
        dueOn: booking.checkOut,
        amount: booking.amount,
        status,
      };
    });
}

export function financePaymentsFromBookings(bookings: Reservation[]): FinancePayment[] {
  return paymentsFromBookings(bookings).map((payment) => {
    const booking = bookings.find((item) => item.id === payment.reservationId);
    let status: FinancePayment["status"] = "Paid";
    if (payment.status === "Pending") status = booking?.paymentStatus === "Partial" ? "Partially Paid" : "Pending";
    if (payment.status === "Refunded") status = "Refunded";
    if (payment.status === "Failed") status = "Failed";
    return {
      id: payment.id,
      reference: payment.id.replace("PAY-", "TXN-"),
      bookingId: payment.reservationId,
      guest: payment.guest,
      method: payment.method === "Cash" ? "Cash" : payment.method === "UPI" ? "UPI" : "Card",
      channel: payment.channel,
      amount: payment.amount,
      status,
      date: payment.date,
      room: booking?.room,
    };
  });
}

export function financeRefundsFromBookings(bookings: Reservation[]): FinanceRefund[] {
  return bookings
    .filter((booking) => booking.paymentStatus === "Refunded" || booking.status === "Cancelled")
    .map((booking) => ({
      id: `REF-${booking.id.replace("RSV-", "")}`,
      paymentId: `PAY-${booking.id.replace("RSV-", "")}`,
      bookingId: booking.id,
      guest: booking.guest,
      amount: booking.amount,
      reason: booking.notes || "Booking cancelled",
      status: booking.paymentStatus === "Refunded" ? "Processed" : "Pending",
      processedOn: booking.checkOut,
      method: booking.source === "Walk-in" ? "Cash" : "UPI",
    }));
}

export function financeInvoicesFromBookings(
  bookings: Reservation[],
  today = todayISO(),
): FinanceInvoiceDetail[] {
  return invoicesFromBookings(bookings, today).map((invoice) => {
    const booking = bookings.find((item) => item.id === invoice.reservationId);
    const paid = booking?.paidAmount ?? 0;
    return {
      id: invoice.id,
      bookingRef: invoice.reservationId,
      guest: invoice.guest,
      room: booking?.room ?? "",
      checkIn: booking?.checkIn ?? invoice.issuedOn,
      checkOut: booking?.checkOut ?? invoice.dueOn,
      charges: invoice.amount,
      discounts: 0,
      taxes: Math.round(invoice.amount * 0.12),
      total: invoice.amount,
      paid,
      balance: Math.max(0, invoice.amount - paid),
      status: invoice.status,
      issuedOn: invoice.issuedOn,
      dueOn: invoice.dueOn,
    };
  });
}

export function calendarFromOps(rooms: Room[], bookings: Reservation[], start = todayISO()) {
  const days = Array.from({ length: 7 }, (_, index) => addDaysISO(start, index));
  const grid: CalendarCell[] = rooms.map((room) => ({
    room: room.name,
    days: days.map((day) => {
      if (room.status === "Maintenance" || room.status === "Cleaning") return "blocked";
      const stay = bookings.find(
        (booking) =>
          booking.room === room.name &&
          booking.status !== "Cancelled" &&
          booking.checkIn <= day &&
          booking.checkOut > day,
      );
      if (!stay) return "free";
      if (stay.status === "Checked-in") return "occupied";
      return "reserved";
    }),
  }));
  return { days: days.map((iso) => iso.slice(8, 10)), isoDays: days, grid };
}

export function checkInQueueFromBookings(bookings: Reservation[], today = todayISO()) {
  return bookings
    .filter(
      (booking) =>
        (booking.status === "Confirmed" || booking.status === "Pending") &&
        booking.checkIn <= today,
    )
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn) || a.guest.localeCompare(b.guest));
}

/** Upcoming arrivals in the next few days (not yet due). */
export function upcomingCheckInsFromBookings(
  bookings: Reservation[],
  today = todayISO(),
  withinDays = 7,
) {
  const until = addDaysISO(today, withinDays);
  return bookings
    .filter(
      (booking) =>
        (booking.status === "Confirmed" || booking.status === "Pending") &&
        booking.checkIn > today &&
        booking.checkIn <= until,
    )
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
}

export function checkOutQueueFromBookings(bookings: Reservation[], today = todayISO()) {
  return bookings
    .filter(
      (booking) => booking.status === "Checked-in" && booking.checkOut <= today,
    )
    .sort((a, b) => a.checkOut.localeCompare(b.checkOut) || a.guest.localeCompare(b.guest));
}

export function upcomingCheckOutsFromBookings(
  bookings: Reservation[],
  today = todayISO(),
  withinDays = 7,
) {
  const until = addDaysISO(today, withinDays);
  return bookings
    .filter(
      (booking) =>
        booking.status === "Checked-in" &&
        booking.checkOut > today &&
        booking.checkOut <= until,
    )
    .sort((a, b) => a.checkOut.localeCompare(b.checkOut));
}

export function checkedInTodayFromBookings(bookings: Reservation[], today = todayISO()) {
  return bookings.filter(
    (booking) => booking.status === "Checked-in" && booking.checkIn === today,
  );
}

export function checkedOutTodayFromBookings(bookings: Reservation[], today = todayISO()) {
  return bookings.filter(
    (booking) => booking.status === "Checked-out" && booking.checkOut === today,
  );
}

export function toHousekeepingStatus(room: StaffRoom): HousekeepingRoomStatus {
  if (room.dashboardStatus === "Maintenance") return "Dirty";
  if (room.housekeeping_status === "in_progress" || room.status === "cleaning") {
    return "Cleaning in Progress";
  }
  if (room.housekeeping_status === "inspected") return "Inspected";
  if (room.housekeeping_status === "dirty" || room.status === "dirty") {
    return room.status === "dirty" ? "Dirty" : "Cleaning Required";
  }
  if (room.status === "ready" || room.dashboardStatus === "Available") return "Ready";
  return "Clean";
}

export function housekeepingPatchFromStatus(status: HousekeepingRoomStatus): {
  status: string;
  housekeeping_status: string;
} {
  switch (status) {
    case "Dirty":
    case "Cleaning Required":
      return { status: "dirty", housekeeping_status: "dirty" };
    case "Cleaning in Progress":
      return { status: "cleaning", housekeeping_status: "in_progress" };
    case "Clean":
      return { status: "cleaning", housekeeping_status: "clean" };
    case "Inspected":
      return { status: "ready", housekeeping_status: "inspected" };
    case "Ready":
      return { status: "ready", housekeeping_status: "clean" };
    default:
      return { status: "ready", housekeeping_status: "clean" };
  }
}

export function assignedRoomsFromStaff(rooms: StaffRoom[]): AssignedRoom[] {
  return rooms.map((room) => {
    const status = toHousekeepingStatus(room);
    const occupied = room.dashboardStatus === "Occupied";
    return {
      id: room.id,
      roomNumber: room.display_name || room.name || room.code,
      roomType: room.room_type_name || room.type,
      status,
      priority: status === "Dirty" || status === "Cleaning Required" ? "High" : "Medium",
      taskType: occupied ? "Stayover" : "Checkout clean",
      assignee: room.assignee || "Unassigned",
      notes: room.notes,
    };
  });
}

export function tasksFromRooms(rooms: StaffRoom[]): HousekeepingTask[] {
  return assignedRoomsFromStaff(rooms).map((room) => ({
    id: `HK-${room.id.slice(0, 6)}`,
    room: room.roomNumber,
    type: room.taskType,
    assignee: room.assignee,
    priority: room.priority,
    status:
      room.status === "Ready" || room.status === "Inspected" || room.status === "Clean"
        ? "Done"
        : room.status === "Cleaning in Progress"
          ? "In progress"
          : "Queued",
    due: "Today",
  }));
}

export function mapMaintenanceTicket(ticket: StaffMaintenanceTicket): MaintenanceTicket {
  return {
    id: ticket.id,
    room: ticket.room,
    issue: ticket.issue,
    priority: ticket.priority,
    status: ticket.status,
    reportedBy: ticket.reportedBy,
    reportedAt: ticket.reportedAt,
  };
}

export function buildDashboardSummary(rooms: Room[], bookings: Reservation[], today = todayISO()) {
  const occupied = rooms.filter((room) => room.status === "Occupied").length;
  const available = rooms.filter((room) => room.status === "Available").length;
  const reserved = rooms.filter((room) => room.status === "Reserved").length;
  const paidToday = bookings
    .filter((booking) => booking.checkIn === today || booking.checkOut === today)
    .reduce((sum, booking) => sum + booking.paidAmount, 0);
  const monthPrefix = today.slice(0, 7);
  const monthly = bookings
    .filter((booking) => booking.checkIn.startsWith(monthPrefix))
    .reduce((sum, booking) => sum + booking.paidAmount, 0);
  return {
    totalRooms: rooms.length,
    availableRooms: available,
    occupiedRooms: occupied,
    reservedRooms: reserved,
    cleaningRequired: rooms.filter((room) => room.status === "Cleaning").length,
    maintenanceRooms: rooms.filter((room) => room.status === "Maintenance").length,
    todaysCheckIns: checkInQueueFromBookings(bookings, today).length,
    todaysCheckOuts: checkOutQueueFromBookings(bookings, today).length,
    currentGuests: bookings
      .filter((booking) => booking.status === "Checked-in")
      .reduce((sum, booking) => sum + booking.adults + booking.children, 0),
    pendingReservations: bookings.filter((booking) => booking.status === "Pending").length,
    todaysRevenue: paidToday,
    monthlyRevenue: monthly,
  };
}

export function buildBookingOverview(bookings: Reservation[], today = todayISO()) {
  return {
    todaysBookings: bookings.filter((booking) => booking.checkIn === today).length,
    upcomingBookings: bookings.filter(
      (booking) =>
        booking.checkIn > today &&
        (booking.status === "Confirmed" || booking.status === "Pending"),
    ).length,
    pendingBookings: bookings.filter((booking) => booking.status === "Pending").length,
    confirmedBookings: bookings.filter((booking) => booking.status === "Confirmed").length,
    cancelledBookings: bookings.filter((booking) => booking.status === "Cancelled").length,
    completedStays: bookings.filter((booking) => booking.status === "Checked-out").length,
  };
}

export function buildOccupancy(rooms: Room[]) {
  const occupied = rooms.filter((room) => room.status === "Occupied").length;
  const total = rooms.length || 1;
  return {
    occupancyPercent: Math.round((occupied / total) * 100),
    available: rooms.filter((room) => room.status === "Available").length,
    occupied,
    reserved: rooms.filter((room) => room.status === "Reserved").length,
    outOfOrder: rooms.filter((room) => room.status === "Maintenance").length,
    totalInventory: rooms.length,
  };
}

export function buildRevenue(bookings: Reservation[], today = todayISO()) {
  const weekStart = addDaysISO(today, -6);
  const monthPrefix = today.slice(0, 7);
  function slice(from: string, to: string) {
    const rows = bookings.filter(
      (booking) => booking.status !== "Cancelled" && booking.checkIn >= from && booking.checkIn <= to,
    );
    const byRoomType = new Map<string, number>();
    const bySource = new Map<string, number>();
    let online = 0;
    let offline = 0;
    for (const booking of rows) {
      byRoomType.set(booking.roomType, (byRoomType.get(booking.roomType) ?? 0) + booking.paidAmount);
      bySource.set(booking.source, (bySource.get(booking.source) ?? 0) + booking.paidAmount);
      if (booking.source === "Walk-in" || booking.source === "Travel agent") offline += booking.paidAmount;
      else online += booking.paidAmount;
    }
    return {
      total: rows.reduce((sum, booking) => sum + booking.paidAmount, 0),
      byRoomType: Array.from(byRoomType, ([label, amount]) => ({ label, amount })),
      byBookingSource: Array.from(bySource, ([label, amount]) => ({ label, amount })),
      onlinePayments: online,
      offlinePayments: offline,
    };
  }
  return {
    today: { label: "Today", ...slice(today, today) },
    weekly: { label: "This week", ...slice(weekStart, today) },
    monthly: { label: "This month", ...slice(`${monthPrefix}-01`, today) },
  };
}

export function analyticsFromBookings(bookings: Reservation[], today = todayISO()) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDaysISO(today, index - 6);
    const rows = bookings.filter((booking) => booking.checkIn === day && booking.status !== "Cancelled");
    return {
      day: new Date(`${day}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short" }),
      bookings: rows.length,
      revenue: rows.reduce((sum, booking) => sum + booking.paidAmount, 0),
    };
  });
}

export function liveNotifications(
  roleId: RoleId | undefined,
  bookings: Reservation[],
  rooms: Room[],
  enquiryCount: number,
  today = todayISO(),
): AppNotification[] {
  if (!roleId) return [];
  const arrivals = checkInQueueFromBookings(bookings, today).length;
  const pendingPay = bookings.filter((booking) => booking.paymentStatus === "Pending").length;
  const cleaning = rooms.filter((room) => room.status === "Cleaning").length;
  const items: AppNotification[] = [
    {
      id: "live-arrivals",
      title: `${arrivals} arrival${arrivals === 1 ? "" : "s"} today`,
      message: arrivals
        ? "Open check-in to process arriving guests from website and desk bookings."
        : "No arrivals scheduled for today.",
      channel: "operational",
      type: "Arrival",
      read: arrivals === 0,
      time: "Live",
      roles: ["super_administrator", "resort_manager", "front_desk"],
    },
    {
      id: "live-payments",
      title: pendingPay ? `${pendingPay} payments pending` : "Payments are current",
      message: pendingPay
        ? "Collect outstanding balances from the payments or check-out queue."
        : "No pending guest payments right now.",
      channel: "operational",
      type: "Payment",
      read: pendingPay === 0,
      time: "Live",
      roles: ["super_administrator", "resort_manager", "front_desk", "accountant"],
    },
    {
      id: "live-hk",
      title: cleaning ? `${cleaning} rooms need cleaning` : "Housekeeping is clear",
      message: cleaning
        ? "Rooms marked dirty after checkout are waiting on housekeeping."
        : "No rooms currently in the cleaning queue.",
      channel: "operational",
      type: "Housekeeping",
      read: cleaning === 0,
      time: "Live",
      roles: ["super_administrator", "resort_manager", "housekeeping"],
    },
    {
      id: "live-enquiries",
      title: enquiryCount ? `${enquiryCount} website enquiries` : "No new enquiries",
      message: "Website contact form submissions appear in Enquiries.",
      channel: "operational",
      type: "System",
      read: enquiryCount === 0,
      time: "Live",
      roles: ["super_administrator", "resort_manager", "front_desk", "website_content_manager"],
    },
  ];
  return items.filter((item) => item.roles.includes(roleId));
}

export function offersFromCms(offers: CmsWebsiteOffer[]): Offer[] {
  const today = todayISO();
  return offers.map((offer) => {
    let status: Offer["status"] = "Active";
    if (offer.validFrom && offer.validFrom > today) status = "Scheduled";
    if (offer.validTo && offer.validTo < today) status = "Expired";
    if (!offer.active) status = "Expired";
    return {
      id: offer.id,
      title: offer.title,
      code: offer.code,
      discount: offer.discount,
      validFrom: offer.validFrom,
      validTo: offer.validTo,
      status,
      usage: 0,
    };
  });
}

export function addOnsFromCms(experiences: CmsExperience[]): AddOn[] {
  return experiences.map((item) => ({
    id: item.id,
    name: item.title,
    category: "Experience",
    price: 0,
    status: item.status === "Published" ? "Active" : "Inactive",
    bookings: 0,
  }));
}

export function mapDirectoryUser(user: StaffDirectoryUser) {
  const name = user.name || `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return {
    id: user.id,
    name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    initials: initials || "ST",
    roleId: user.role_id,
    status: (user.is_active ? "Active" : "Disabled") as "Active" | "Invited" | "Disabled",
    lastActive: user.last_login ? "Recently" : "—",
    createdAt: user.created_at?.slice(0, 10) ?? todayISO(),
    password: "",
    permissions: Array.isArray(user.permissions)
      ? (user.permissions as import("@/lib/roles").Permission[])
      : undefined,
  };
}
