"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Guest, Invoice, MaintenanceTicket, Payment } from "@/lib/ops-data";
import {
  addDaysISO,
  assignedRoomsFromStaff,
  buildBookingOverview,
  buildDashboardSummary,
  buildOccupancy,
  buildRevenue,
  calendarFromOps,
  checkInQueueFromBookings,
  checkOutQueueFromBookings,
  checkedInTodayFromBookings,
  checkedOutTodayFromBookings,
  upcomingCheckInsFromBookings,
  upcomingCheckOutsFromBookings,
  financeInvoicesFromBookings,
  financePaymentsFromBookings,
  financeRefundsFromBookings,
  guestsFromBookings,
  invoicesFromBookings,
  liveNotifications,
  mapMaintenanceTicket,
  mapStaffBooking,
  mapStaffRoom,
  paymentsFromBookings,
  tasksFromRooms,
  todayISO,
  analyticsFromBookings,
} from "@/lib/ops-live";
import type { Reservation } from "@/lib/reservations";
import type { Room } from "@/lib/rooms";
import { CMS_UPDATED_EVENT } from "@/lib/cms-storage";
import { roomTypesFromRooms } from "@/lib/ops-rooms-local";
import {
  applyGuestOverrides,
  guestOverrideFromGuest,
  loadLocalGuestOverrides,
  saveLocalGuestOverrides,
  upsertGuestOverride,
  type GuestOverride,
} from "@/lib/ops-guests-local";
import {
  createStaffBooking,
  createStaffMaintenance,
  createStaffRoom,
  createStaffRoomType,
  fetchStaffBookings,
  fetchStaffEnquiries,
  fetchStaffMaintenance,
  fetchStaffRoomTypes,
  fetchStaffRooms,
  updateStaffBooking,
  updateStaffMaintenance,
  updateStaffRoom,
  updateStaffRoomStatus,
  updateStaffRoomType,
  type StaffRoom,
  type StaffRoomType,
} from "@/lib/staff-api-client";

type OpsContextValue = {
  ready: boolean;
  source: "api" | "empty";
  error: string | null;
  today: string;
  bookings: Reservation[];
  rooms: Room[];
  staffRooms: StaffRoom[];
  roomTypes: StaffRoomType[];
  roomTypeNames: string[];
  guests: Guest[];
  payments: Payment[];
  invoices: Invoice[];
  maintenance: MaintenanceTicket[];
  summary: ReturnType<typeof buildDashboardSummary>;
  bookingOverview: ReturnType<typeof buildBookingOverview>;
  occupancy: ReturnType<typeof buildOccupancy>;
  revenue: ReturnType<typeof buildRevenue>;
  analytics: ReturnType<typeof analyticsFromBookings>;
  calendar: ReturnType<typeof calendarFromOps>;
  checkInQueue: Reservation[];
  checkOutQueue: Reservation[];
  upcomingCheckIns: Reservation[];
  upcomingCheckOuts: Reservation[];
  checkedInToday: Reservation[];
  checkedOutToday: Reservation[];
  hkRooms: ReturnType<typeof assignedRoomsFromStaff>;
  hkTasks: ReturnType<typeof tasksFromRooms>;
  financePayments: ReturnType<typeof financePaymentsFromBookings>;
  financeRefunds: ReturnType<typeof financeRefundsFromBookings>;
  financeInvoices: ReturnType<typeof financeInvoicesFromBookings>;
  notifications: ReturnType<typeof liveNotifications>;
  enquiryCount: number;
  refresh: () => Promise<void>;
  saveBooking: (id: string, patch: Partial<Reservation>) => Promise<void>;
  createBooking: (input: {
    guest: string;
    email: string;
    phone: string;
    roomType: string;
    roomId?: string;
    roomName?: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    children?: number;
    source?: string;
  }) => Promise<void>;
  saveRoom: (room: Room) => Promise<void>;
  saveRoomStatus: (room: Room) => Promise<void>;
  addRoom: (room: Room) => Promise<void>;
  saveGuest: (guest: Guest, previous: Guest) => Promise<void>;
  recordPayment: (bookingId: string, amount?: number) => Promise<void>;
  advanceMaintenance: (id: string) => Promise<void>;
  reportMaintenance: (input: {
    room: string;
    roomId?: string;
    issue: string;
    category?: string;
    reportedBy?: string;
  }) => Promise<void>;
  updateHousekeeping: (
    roomId: string,
    patch: { status?: string; housekeeping_status?: string; assignee?: string },
  ) => Promise<void>;
};

const OpsContext = createContext<OpsContextValue | null>(null);

export function OpsProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, ready: authReady } = useAuth();
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<"api" | "empty">("empty");
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [staffRooms, setStaffRooms] = useState<StaffRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<StaffRoomType[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>([]);
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [guestOverrides, setGuestOverrides] = useState<GuestOverride[]>([]);
  const today = todayISO();

  useEffect(() => {
    setGuestOverrides(loadLocalGuestOverrides());
  }, []);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setReady(true);
      return;
    }
    try {
      const settled = await Promise.allSettled([
        fetchStaffBookings(),
        fetchStaffRooms(),
        fetchStaffRoomTypes(),
        fetchStaffMaintenance(),
        fetchStaffEnquiries(),
      ]);
      const [bookingRows, roomRows, typeRows, ticketRows, enquiryRows] = settled.map((item) => {
        if (item.status === "fulfilled") return item.value;
        return [];
      }) as [
        Awaited<ReturnType<typeof fetchStaffBookings>>,
        Awaited<ReturnType<typeof fetchStaffRooms>>,
        Awaited<ReturnType<typeof fetchStaffRoomTypes>>,
        Awaited<ReturnType<typeof fetchStaffMaintenance>>,
        Awaited<ReturnType<typeof fetchStaffEnquiries>>,
      ];

      const roomsFailed = settled[1].status === "rejected";
      const typesFailed = settled[2].status === "rejected";
      if (roomsFailed || typesFailed) {
        const reason = roomsFailed ? settled[1] : settled[2];
        const message =
          reason.status === "rejected" && reason.reason instanceof Error
            ? reason.reason.message
            : "Could not load rooms from the server.";
        setError(message);
      } else {
        setError(null);
      }

      setBookings(bookingRows.map(mapStaffBooking));
      // Live inventory only — never mix CMS marketing rooms or localStorage stubs.
      setStaffRooms(roomRows);
      setRoomTypes(typeRows.length > 0 ? typeRows : roomTypesFromRooms(roomRows.map(mapStaffRoom)));
      setMaintenance(ticketRows.map(mapMaintenanceTicket));
      setEnquiryCount(enquiryRows.filter((item) => item.status === "New").length);
      setSource(bookingRows.length || roomRows.length || typeRows.length ? "api" : "empty");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load operations data.");
      setSource("empty");
    } finally {
      setReady(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authReady) return;
    void refresh();
  }, [authReady, refresh]);

  useEffect(() => {
    function onCmsUpdated() {
      void refresh();
    }
    window.addEventListener(CMS_UPDATED_EVENT, onCmsUpdated);
    return () => window.removeEventListener(CMS_UPDATED_EVENT, onCmsUpdated);
  }, [refresh]);

  const rooms = useMemo(() => staffRooms.map(mapStaffRoom), [staffRooms]);

  const saveBooking = useCallback(async (id: string, patch: Partial<Reservation>) => {
    setBookings((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    const roomMatch = patch.room
      ? staffRooms.find(
          (item) =>
            item.display_name === patch.room ||
            item.name === patch.room ||
            item.code === patch.room ||
            item.number === patch.room,
        )
      : undefined;
    await updateStaffBooking(id, {
      status: patch.status,
      payment_status: patch.paymentStatus,
      paid_amount: patch.paidAmount,
      notes: patch.notes,
      room_unit: roomMatch?.id,
    });
    await refresh();
  }, [refresh, staffRooms]);

  const createBooking = useCallback(
    async (input: {
      guest: string;
      email: string;
      phone: string;
      roomType: string;
      roomId?: string;
      roomName?: string;
      checkIn: string;
      checkOut: string;
      adults?: number;
      children?: number;
      source?: string;
    }) => {
      const unit =
        (input.roomId
          ? staffRooms.find((item) => item.id === input.roomId)
          : undefined) ??
        staffRooms.find(
          (item) =>
            item.display_name === input.roomName ||
            item.name === input.roomName ||
            item.code === input.roomName ||
            item.number === input.roomName,
        );
      // Django expects `room` / `roomType` to be a room-type slug or name — not the unit label.
      const typeSlug = unit?.room_type_slug?.trim();
      const typeName = (unit?.room_type_name || unit?.type || input.roomType).trim();
      await createStaffBooking({
        guest: input.guest,
        email: input.email,
        phone: input.phone,
        room: typeSlug || typeName,
        roomType: typeName,
        room_unit: input.roomId || unit?.id,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.adults,
        children: input.children,
        source: input.source,
      });
      await refresh();
    },
    [refresh, staffRooms],
  );

  const ensureRoomType = useCallback(
    async (room: Room) => {
      const name = room.type.trim();
      const match = roomTypes.find(
        (item) =>
          item.name.toLowerCase() === name.toLowerCase() || item.slug === name,
      );
      const payload = {
        name,
        max_guests: room.capacity,
        beds: room.beds,
        base_rate: room.rate,
        size_sq_ft: room.sizeSqFt,
        size_label: room.sizeSqFt ? `${room.sizeSqFt} sq ft` : "",
        amenities: room.amenities,
        short_description: room.name,
      };
      if (match) {
        await updateStaffRoomType(match.slug, payload);
        return match;
      }
      return createStaffRoomType(payload);
    },
    [roomTypes],
  );

  const saveRoomStatus = useCallback(
    async (room: Room) => {
      await updateStaffRoomStatus(room.id, {
        dashboardStatus: room.status,
        notes: room.notes,
      });
      await refresh();
    },
    [refresh],
  );

  const saveRoom = useCallback(
    async (room: Room) => {
      const type = await ensureRoomType(room);
      await updateStaffRoom(room.id, {
        room_type_id: type.id,
        code: room.number,
        name: room.name,
        floor: String(room.floor),
        capacity: room.capacity,
        notes: room.notes,
      });
      await updateStaffRoomStatus(room.id, {
        dashboardStatus: room.status,
        notes: room.notes,
      });
      await refresh();
    },
    [refresh, ensureRoomType],
  );

  const saveGuest = useCallback(
    async (guest: Guest, previous: Guest) => {
      const override = guestOverrideFromGuest(guest, previous);
      setGuestOverrides((prev) => {
        const next = upsertGuestOverride(prev, override);
        saveLocalGuestOverrides(next);
        return next;
      });

      const contactChanged =
        guest.name !== previous.name ||
        guest.email !== previous.email ||
        guest.phone !== previous.phone;

      if (contactChanged) {
        const previousEmail = previous.email.trim().toLowerCase();
        const related = bookings.filter(
          (booking) =>
            booking.guest === previous.name ||
            booking.email.trim().toLowerCase() === previousEmail,
        );
        if (related.length) {
          setBookings((prev) =>
            prev.map((booking) =>
              booking.guest === previous.name ||
              booking.email.trim().toLowerCase() === previousEmail
                ? {
                    ...booking,
                    guest: guest.name,
                    email: guest.email,
                    phone: guest.phone,
                  }
                : booking,
            ),
          );
          await Promise.allSettled(
            related.map((booking) =>
              updateStaffBooking(booking.id, {
                guest: guest.name,
                email: guest.email,
                phone: guest.phone,
              }),
            ),
          );
          await refresh();
        }
      }
    },
    [bookings, refresh],
  );

  const addRoom = useCallback(
    async (room: Room) => {
      const type = await ensureRoomType(room);
      const created = await createStaffRoom({
        room_type_id: type.id,
        code: room.number,
        name: room.name,
        floor: String(room.floor),
        capacity: room.capacity,
        notes: room.notes,
      });
      await updateStaffRoomStatus(created.id, {
        dashboardStatus: room.status,
        notes: room.notes,
      });
      await refresh();
    },
    [refresh, ensureRoomType],
  );

  const recordPayment = useCallback(
    async (bookingId: string, amount?: number) => {
      const booking = bookings.find((item) => item.id === bookingId);
      if (!booking) return;
      const paid = amount ?? booking.amount;
      const paymentStatus = paid >= booking.amount ? "Paid" : "Partial";
      await saveBooking(bookingId, { paidAmount: paid, paymentStatus });
    },
    [bookings, saveBooking],
  );

  const advanceMaintenance = useCallback(
    async (id: string) => {
      const ticket = maintenance.find((item) => item.id === id);
      if (!ticket) return;
      const next =
        ticket.status === "Open" ? "In progress" : ticket.status === "In progress" ? "Resolved" : "Resolved";
      await updateStaffMaintenance(id, { status: next });
      await refresh();
    },
    [maintenance, refresh],
  );

  const reportMaintenance = useCallback(
    async (input: {
      room: string;
      roomId?: string;
      issue: string;
      category?: string;
      reportedBy?: string;
    }) => {
      await createStaffMaintenance({
        room: input.room,
        roomUnitId: input.roomId,
        issue: input.issue,
        category: input.category,
        reportedBy: input.reportedBy,
      });
      await refresh();
    },
    [refresh],
  );

  const updateHousekeeping = useCallback(
    async (
      roomId: string,
      patch: { status?: string; housekeeping_status?: string; assignee?: string },
    ) => {
      await updateStaffRoomStatus(roomId, patch);
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<OpsContextValue>(() => {
    const guests = applyGuestOverrides(guestsFromBookings(bookings), guestOverrides);
    const payments = paymentsFromBookings(bookings);
    const invoices = invoicesFromBookings(bookings, today);
    return {
      ready,
      source,
      error,
      today,
      bookings,
      rooms,
      staffRooms,
      roomTypes,
      roomTypeNames: roomTypes.map((item) => item.name),
      guests,
      payments,
      invoices,
      maintenance,
      summary: buildDashboardSummary(rooms, bookings, today),
      bookingOverview: buildBookingOverview(bookings, today),
      occupancy: buildOccupancy(rooms),
      revenue: buildRevenue(bookings, today),
      analytics: analyticsFromBookings(bookings, today),
      calendar: calendarFromOps(rooms, bookings, today),
      checkInQueue: checkInQueueFromBookings(bookings, today),
      checkOutQueue: checkOutQueueFromBookings(bookings, today),
      upcomingCheckIns: upcomingCheckInsFromBookings(bookings, today),
      upcomingCheckOuts: upcomingCheckOutsFromBookings(bookings, today),
      checkedInToday: checkedInTodayFromBookings(bookings, today),
      checkedOutToday: checkedOutTodayFromBookings(bookings, today),
      hkRooms: assignedRoomsFromStaff(staffRooms),
      hkTasks: tasksFromRooms(staffRooms),
      financePayments: financePaymentsFromBookings(bookings),
      financeRefunds: financeRefundsFromBookings(bookings),
      financeInvoices: financeInvoicesFromBookings(bookings, today),
      notifications: liveNotifications(currentUser?.roleId, bookings, rooms, enquiryCount, today),
      enquiryCount,
      refresh,
      saveBooking,
      createBooking,
      saveRoom,
      saveRoomStatus,
      addRoom,
      saveGuest,
      recordPayment,
      advanceMaintenance,
      reportMaintenance,
      updateHousekeeping,
    };
  }, [
    ready,
    source,
    error,
    today,
    bookings,
    rooms,
    staffRooms,
    roomTypes,
    guestOverrides,
    maintenance,
    currentUser?.roleId,
    enquiryCount,
    refresh,
    saveBooking,
    createBooking,
    saveRoom,
    saveRoomStatus,
    addRoom,
    saveGuest,
    recordPayment,
    advanceMaintenance,
    reportMaintenance,
    updateHousekeeping,
  ]);

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

export function useOps() {
  const context = useContext(OpsContext);
  if (!context) {
    throw new Error("useOps must be used within OpsProvider");
  }
  return context;
}

export function useOptionalOps() {
  return useContext(OpsContext);
}

export { addDaysISO, todayISO };
