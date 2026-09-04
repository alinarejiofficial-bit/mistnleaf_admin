export type RoomStatus =
  | "Available"
  | "Occupied"
  | "Reserved"
  | "Cleaning"
  | "Maintenance";

export type RoomType = string;

export type Room = {
  id: string;
  number: string;
  name: string;
  type: RoomType;
  floor: number;
  capacity: number;
  beds: string;
  rate: number;
  sizeSqFt: number;
  amenities: string[];
  status: RoomStatus;
  imageUrl?: string;
  guest?: string;
  reservationId?: string;
  notes?: string;
};

export const roomStatusStyles: Record<RoomStatus, string> = {
  Available: "bg-[#e8f3ec] text-success",
  Occupied: "bg-brand-soft text-brand",
  Reserved: "bg-[#e7f0f5] text-info",
  Cleaning: "bg-accent-soft text-[#8a6a2f]",
  Maintenance: "bg-[#f8e9e6] text-danger",
};

export const roomTypes: RoomType[] = [
  "Canopy Suite",
  "Mist Cottage",
  "Leaf Room",
];

export const rooms: Room[] = [
  {
    id: "RM-01",
    number: "01",
    name: "Mist Twin 01",
    type: "Mist Twin",
    floor: 1,
    capacity: 2,
    beds: "2 twin beds",
    rate: 4800,
    sizeSqFt: 280,
    amenities: ["AC", "Wi-Fi", "Ensuite"],
    status: "Available",
  },
  {
    id: "RM-02",
    number: "02",
    name: "Mist Twin 02",
    type: "Mist Twin",
    floor: 1,
    capacity: 2,
    beds: "2 twin beds",
    rate: 4800,
    sizeSqFt: 280,
    amenities: ["AC", "Wi-Fi", "Ensuite"],
    status: "Occupied",
    guest: "Vikram Seth",
    reservationId: "RSV-2029",
  },
  {
    id: "RM-03",
    number: "03",
    name: "Leaf Suite 03",
    type: "Leaf Suite",
    floor: 1,
    capacity: 3,
    beds: "1 king + sofa bed",
    rate: 9200,
    sizeSqFt: 520,
    amenities: ["AC", "Wi-Fi", "Balcony", "Mini bar"],
    status: "Cleaning",
    notes: "Checkout completed this morning",
  },
  {
    id: "RM-04",
    number: "04",
    name: "Mist Twin 04",
    type: "Mist Twin",
    floor: 1,
    capacity: 2,
    beds: "2 twin beds",
    rate: 4800,
    sizeSqFt: 280,
    amenities: ["AC", "Wi-Fi", "Ensuite"],
    status: "Reserved",
    guest: "Rahul Mehta",
    reservationId: "RSV-2042",
  },
  {
    id: "RM-05",
    number: "05",
    name: "Garden Deluxe 05",
    type: "Garden Deluxe",
    floor: 1,
    capacity: 2,
    beds: "1 queen bed",
    rate: 7200,
    sizeSqFt: 360,
    amenities: ["AC", "Wi-Fi", "Garden view"],
    status: "Occupied",
    guest: "Sana Qureshi",
    reservationId: "RSV-2035",
  },
  {
    id: "RM-06",
    number: "06",
    name: "Garden Deluxe 06",
    type: "Garden Deluxe",
    floor: 1,
    capacity: 2,
    beds: "1 queen bed",
    rate: 7200,
    sizeSqFt: 360,
    amenities: ["AC", "Wi-Fi", "Garden view"],
    status: "Available",
  },
  {
    id: "RM-07",
    number: "07",
    name: "Canopy King 07",
    type: "Canopy King",
    floor: 2,
    capacity: 2,
    beds: "1 king bed",
    rate: 8500,
    sizeSqFt: 420,
    amenities: ["AC", "Wi-Fi", "Bathtub", "Work desk"],
    status: "Occupied",
    guest: "Daniel Ortiz",
    reservationId: "RSV-2036",
  },
  {
    id: "RM-08",
    number: "08",
    name: "Garden Deluxe 08",
    type: "Garden Deluxe",
    floor: 2,
    capacity: 2,
    beds: "1 queen bed",
    rate: 7200,
    sizeSqFt: 360,
    amenities: ["AC", "Wi-Fi", "Garden view"],
    status: "Occupied",
    guest: "Priya Nair",
    reservationId: "RSV-2038",
  },
  {
    id: "RM-09",
    number: "09",
    name: "Mist Twin 09",
    type: "Mist Twin",
    floor: 2,
    capacity: 2,
    beds: "2 twin beds",
    rate: 4800,
    sizeSqFt: 280,
    amenities: ["AC", "Wi-Fi", "Ensuite"],
    status: "Cleaning",
  },
  {
    id: "RM-10",
    number: "10",
    name: "Canopy King 10",
    type: "Canopy King",
    floor: 2,
    capacity: 2,
    beds: "1 king bed",
    rate: 8500,
    sizeSqFt: 420,
    amenities: ["AC", "Wi-Fi", "Bathtub"],
    status: "Maintenance",
    notes: "AC compressor replacement",
  },
  {
    id: "RM-11",
    number: "11",
    name: "Leaf Suite 11",
    type: "Leaf Suite",
    floor: 2,
    capacity: 3,
    beds: "1 king + sofa bed",
    rate: 9200,
    sizeSqFt: 520,
    amenities: ["AC", "Wi-Fi", "Balcony", "Mini bar"],
    status: "Occupied",
    guest: "Tara Banerjee",
    reservationId: "RSV-2031",
  },
  {
    id: "RM-12",
    number: "12",
    name: "Leaf Suite 12",
    type: "Leaf Suite",
    floor: 2,
    capacity: 3,
    beds: "1 king + sofa bed",
    rate: 9200,
    sizeSqFt: 520,
    amenities: ["AC", "Wi-Fi", "Balcony", "Mini bar", "Lounge"],
    status: "Reserved",
    guest: "Ananya Sharma",
    reservationId: "RSV-2041",
  },
  {
    id: "RM-13",
    number: "13",
    name: "Mist Twin 13",
    type: "Mist Twin",
    floor: 3,
    capacity: 2,
    beds: "2 twin beds",
    rate: 5000,
    sizeSqFt: 290,
    amenities: ["AC", "Wi-Fi", "Ensuite", "Mountain view"],
    status: "Occupied",
    guest: "Leo Fernandes",
    reservationId: "RSV-2039",
  },
  {
    id: "RM-14",
    number: "14",
    name: "Garden Deluxe 14",
    type: "Garden Deluxe",
    floor: 3,
    capacity: 2,
    beds: "1 queen bed",
    rate: 7400,
    sizeSqFt: 370,
    amenities: ["AC", "Wi-Fi", "Garden view", "Tea set"],
    status: "Available",
  },
  {
    id: "RM-15",
    number: "15",
    name: "Canopy King 15",
    type: "Canopy King",
    floor: 3,
    capacity: 2,
    beds: "1 king bed",
    rate: 8700,
    sizeSqFt: 430,
    amenities: ["AC", "Wi-Fi", "Bathtub", "Mountain view"],
    status: "Occupied",
    guest: "Hiroshi Tanaka",
    reservationId: "RSV-2040",
  },
  {
    id: "RM-16",
    number: "16",
    name: "Mist Twin 16",
    type: "Mist Twin",
    floor: 3,
    capacity: 2,
    beds: "2 twin beds",
    rate: 5000,
    sizeSqFt: 290,
    amenities: ["AC", "Wi-Fi", "Ensuite"],
    status: "Cleaning",
  },
  {
    id: "RM-17",
    number: "17",
    name: "Garden Deluxe 17",
    type: "Garden Deluxe",
    floor: 3,
    capacity: 2,
    beds: "1 queen bed",
    rate: 7400,
    sizeSqFt: 370,
    amenities: ["AC", "Wi-Fi", "Garden view"],
    status: "Occupied",
    guest: "Emily Brooks",
    reservationId: "RSV-2027",
  },
  {
    id: "RM-18",
    number: "18",
    name: "Leaf Suite 18",
    type: "Leaf Suite",
    floor: 3,
    capacity: 4,
    beds: "1 king + 2 twins",
    rate: 9800,
    sizeSqFt: 560,
    amenities: ["AC", "Wi-Fi", "Balcony", "Mini bar", "Living area"],
    status: "Occupied",
    guest: "The Kapoor Family",
    reservationId: "RSV-2028",
  },
  {
    id: "RM-19",
    number: "19",
    name: "Canopy King 19",
    type: "Canopy King",
    floor: 4,
    capacity: 2,
    beds: "1 king bed",
    rate: 8900,
    sizeSqFt: 440,
    amenities: ["AC", "Wi-Fi", "Bathtub", "Work desk"],
    status: "Available",
  },
  {
    id: "RM-20",
    number: "20",
    name: "Garden Deluxe 20",
    type: "Garden Deluxe",
    floor: 4,
    capacity: 2,
    beds: "1 queen bed",
    rate: 7600,
    sizeSqFt: 380,
    amenities: ["AC", "Wi-Fi", "Garden view"],
    status: "Reserved",
    guest: "Nora Ellis",
    reservationId: "RSV-2044",
  },
  {
    id: "RM-21",
    number: "21",
    name: "Canopy King 21",
    type: "Canopy King",
    floor: 4,
    capacity: 2,
    beds: "1 king bed",
    rate: 8900,
    sizeSqFt: 440,
    amenities: ["AC", "Wi-Fi", "Bathtub", "Mountain view"],
    status: "Occupied",
    guest: "Omar Haddad",
    reservationId: "RSV-2032",
  },
  {
    id: "RM-22",
    number: "22",
    name: "Leaf Suite 22",
    type: "Leaf Suite",
    floor: 4,
    capacity: 3,
    beds: "1 king + sofa bed",
    rate: 9500,
    sizeSqFt: 540,
    amenities: ["AC", "Wi-Fi", "Balcony", "Mini bar"],
    status: "Available",
  },
  {
    id: "RM-23",
    number: "23",
    name: "Mist Twin 23",
    type: "Mist Twin",
    floor: 4,
    capacity: 2,
    beds: "2 twin beds",
    rate: 5200,
    sizeSqFt: 300,
    amenities: ["AC", "Wi-Fi", "Ensuite"],
    status: "Cleaning",
  },
  {
    id: "RM-24",
    number: "24",
    name: "Canopy King 24",
    type: "Canopy King",
    floor: 4,
    capacity: 2,
    beds: "1 king bed",
    rate: 9100,
    sizeSqFt: 450,
    amenities: ["AC", "Wi-Fi", "Bathtub", "Corner view"],
    status: "Maintenance",
    notes: "Plumbing leak under repair",
  },
];

export function getRoomStatusCounts(list: Room[] = rooms) {
  return {
    total: list.length,
    available: list.filter((r) => r.status === "Available").length,
    occupied: list.filter((r) => r.status === "Occupied").length,
    reserved: list.filter((r) => r.status === "Reserved").length,
    cleaning: list.filter((r) => r.status === "Cleaning").length,
    maintenance: list.filter((r) => r.status === "Maintenance").length,
  };
}

export const roomStatuses: RoomStatus[] = [
  "Available",
  "Occupied",
  "Reserved",
  "Cleaning",
  "Maintenance",
];

export function createNextRoomId(list: Room[]) {
  const max = list.reduce((highest, room) => {
    const match = room.id.match(/^RM-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  const next = String(max + 1).padStart(2, "0");
  return { id: `RM-${next}`, number: next };
}

/** Next unit number for a type (e.g. Mist Cottage with MC-01..03 → MC-04). */
export function nextUnitNumberForType(list: Room[], typeName: string): string {
  const ofType = list.filter(
    (room) => room.type.trim().toLowerCase() === typeName.trim().toLowerCase(),
  );
  const parsed = ofType
    .map((room) => room.number.trim().match(/^(.*?)(\d+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match));
  if (parsed.length > 0) {
    const prefix = parsed[0][1];
    const width = Math.max(...parsed.map((match) => match[2].length));
    const maxNum = Math.max(...parsed.map((match) => Number(match[2])));
    return `${prefix}${String(maxNum + 1).padStart(width, "0")}`;
  }
  return String(ofType.length + 1).padStart(2, "0");
}

export function emptyRoom(list: Room[] = rooms): Room {
  const { id, number } = createNextRoomId(list);
  return {
    id,
    number,
    name: `New room ${number}`,
    type: "Mist Twin",
    floor: 1,
    capacity: 2,
    beds: "2 twin beds",
    rate: 4800,
    sizeSqFt: 280,
    amenities: ["AC", "Wi-Fi", "Ensuite"],
    status: "Available",
  };
}

/** Draft a new room under a type, copying details from an existing unit when present. */
export function emptyRoomForType(list: Room[], typeName: string): Room {
  const trimmed = typeName.trim() || "Mist Cottage";
  const base = emptyRoom(list);
  const ofType = list.filter(
    (room) => room.type.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  const template = ofType[0];
  const number = nextUnitNumberForType(list, trimmed);
  const typeLabel = template?.type ?? trimmed;

  return {
    ...base,
    type: typeLabel,
    number,
    name: `${typeLabel} ${number}`,
    floor: template?.floor ?? 1,
    capacity: template?.capacity ?? 2,
    beds: template?.beds ?? "2 twin beds",
    rate: template?.rate ?? 4800,
    sizeSqFt: template?.sizeSqFt ?? 280,
    amenities: template ? [...template.amenities] : ["AC", "Wi-Fi", "Ensuite"],
    imageUrl: template?.imageUrl,
    status: "Available",
  };
}

export function bookingMatchesRoom(
  booking: { room: string; roomType?: string },
  room: Room,
): boolean {
  const label = booking.room.trim().toLowerCase();
  if (!label) return false;
  const number = room.number.trim().toLowerCase();
  const name = room.name.trim().toLowerCase();
  const type = room.type.trim().toLowerCase();
  const id = room.id.trim().toLowerCase();
  if (label === name || label === number || label === id) return true;
  if (label === `${type} ${number}`) return true;
  return Boolean(number) && label.includes(number) && label.includes(type);
}

/** Check-out day is exclusive. */
export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && startB < endA;
}

const BLOCKING_BOOKING_STATUSES = new Set([
  "Pending",
  "Confirmed",
  "Checked-in",
]);

export function isRoomAvailableForDates(
  room: Room,
  checkIn: string,
  checkOut: string,
  bookings: Array<{ room: string; roomType?: string; checkIn: string; checkOut: string; status: string }>,
): boolean {
  if (!checkIn || !checkOut || checkOut <= checkIn) return false;
  if (room.status === "Maintenance") return false;
  return !bookings.some(
    (booking) =>
      BLOCKING_BOOKING_STATUSES.has(booking.status) &&
      bookingMatchesRoom(booking, room) &&
      datesOverlap(booking.checkIn, booking.checkOut, checkIn, checkOut),
  );
}

export function availableRoomsForType(
  rooms: Room[],
  roomType: string,
  checkIn: string,
  checkOut: string,
  bookings: Array<{ room: string; roomType?: string; checkIn: string; checkOut: string; status: string }>,
): Room[] {
  const typeKey = roomType.trim().toLowerCase();
  return rooms
    .filter((room) => room.type.trim().toLowerCase() === typeKey)
    .filter((room) => isRoomAvailableForDates(room, checkIn, checkOut, bookings))
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
}
