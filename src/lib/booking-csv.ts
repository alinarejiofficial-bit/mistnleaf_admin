import type {
  BookingSource,
  PaymentStatus,
  Reservation,
  ReservationStatus,
} from "@/lib/reservations";

export const BOOKING_CSV_HEADERS = [
  "id",
  "guest",
  "email",
  "phone",
  "room",
  "roomType",
  "adults",
  "children",
  "checkIn",
  "checkOut",
  "nights",
  "status",
  "source",
  "paymentStatus",
  "amount",
  "paidAmount",
  "notes",
] as const;

export type BookingCsvRow = {
  guest: string;
  email: string;
  phone: string;
  room: string;
  roomType: string;
  adults: number;
  children: number;
  checkIn: string;
  checkOut: string;
  source: BookingSource;
  status?: ReservationStatus;
  paymentStatus?: PaymentStatus;
  amount?: number;
  paidAmount?: number;
  notes?: string;
};

function escapeCsvCell(value: string | number | undefined | null) {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

const HEADER_ALIASES: Record<string, (typeof BOOKING_CSV_HEADERS)[number]> = {
  id: "id",
  bookingid: "id",
  reservationid: "id",
  guest: "guest",
  guestname: "guest",
  name: "guest",
  email: "email",
  phone: "phone",
  mobile: "phone",
  room: "room",
  roomname: "room",
  roomtype: "roomType",
  type: "roomType",
  adults: "adults",
  children: "children",
  checkin: "checkIn",
  checkout: "checkOut",
  nights: "nights",
  status: "status",
  source: "source",
  paymentstatus: "paymentStatus",
  amount: "amount",
  total: "amount",
  paidamount: "paidAmount",
  paid: "paidAmount",
  notes: "notes",
};

const SOURCES: BookingSource[] = [
  "Direct website",
  "OTA / Booking.com",
  "Walk-in",
  "Travel agent",
];

function parseSource(value: string): BookingSource {
  const match = SOURCES.find(
    (item) => item.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? "Walk-in";
}

function parseIsoDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const dmy = trimmed.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    return `${dmy[3]}-${month}-${day}`;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function reservationsToCsv(rows: Reservation[]): string {
  const lines = [
    BOOKING_CSV_HEADERS.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.guest,
        row.email,
        row.phone,
        row.room,
        row.roomType,
        row.adults,
        row.children,
        row.checkIn,
        row.checkOut,
        row.nights,
        row.status,
        row.source,
        row.paymentStatus,
        row.amount,
        row.paidAmount,
        row.notes ?? "",
      ]
        .map(escapeCsvCell)
        .join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

export function downloadBookingsCsv(rows: Reservation[], filename?: string) {
  const csv = reservationsToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = filename ?? `mistnleaf-bookings-${stamp}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function parseBookingsCsv(text: string): {
  rows: BookingCsvRow[];
  errors: string[];
} {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], errors: ["CSV needs a header row and at least one booking."] };
  }

  const headerCells = parseCsvLine(lines[0]).map(normalizeHeader);
  const indexByField = new Map<(typeof BOOKING_CSV_HEADERS)[number], number>();
  headerCells.forEach((header, index) => {
    const field = HEADER_ALIASES[header];
    if (field) indexByField.set(field, index);
  });

  const required: Array<(typeof BOOKING_CSV_HEADERS)[number]> = [
    "guest",
    "email",
    "phone",
    "roomType",
    "checkIn",
    "checkOut",
  ];
  const missing = required.filter((field) => !indexByField.has(field));
  if (missing.length) {
    return {
      rows: [],
      errors: [`Missing required columns: ${missing.join(", ")}`],
    };
  }

  const rows: BookingCsvRow[] = [];
  const errors: string[] = [];

  lines.slice(1).forEach((line, offset) => {
    const cells = parseCsvLine(line);
    const get = (field: (typeof BOOKING_CSV_HEADERS)[number]) => {
      const index = indexByField.get(field);
      return index == null ? "" : (cells[index] ?? "").trim();
    };

    const guest = get("guest");
    const email = get("email");
    const phone = get("phone");
    const roomType = get("roomType") || get("room");
    const checkIn = parseIsoDate(get("checkIn"));
    const checkOut = parseIsoDate(get("checkOut"));
    const lineNo = offset + 2;

    if (!guest || !email || !phone || !roomType || !checkIn || !checkOut) {
      errors.push(`Row ${lineNo}: guest, email, phone, roomType, checkIn, and checkOut are required.`);
      return;
    }
    if (checkOut < checkIn) {
      errors.push(`Row ${lineNo}: check-out cannot be before check-in.`);
      return;
    }

    rows.push({
      guest,
      email,
      phone,
      room: get("room"),
      roomType,
      adults: Math.max(1, Number(get("adults")) || 1),
      children: Math.max(0, Number(get("children")) || 0),
      checkIn,
      checkOut,
      source: parseSource(get("source")),
      notes: get("notes") || undefined,
    });
  });

  return { rows, errors };
}
