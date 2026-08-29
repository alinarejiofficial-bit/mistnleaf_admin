import type {
  Addon,
  Booking,
  Guest,
  Invoice,
  Offer,
  PaymentRecord,
  RoomType,
  RoomUnit,
  StaffUser,
} from "@/types/domain";

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const staffUsers: StaffUser[] = [
  {
    id: "u-mgmt",
    name: "Asha Menon",
    email: "manager@mistnleaf.demo",
    role: "management",
    password: "manager123",
  },
  {
    id: "u-desk",
    name: "Rahul Iyer",
    email: "frontdesk@mistnleaf.demo",
    role: "front_desk",
    password: "desk123",
  },
  {
    id: "u-hk",
    name: "Latha Krishnan",
    email: "housekeeping@mistnleaf.demo",
    role: "housekeeping",
    password: "hk123",
  },
];

export const roomTypes: RoomType[] = [
  {
    id: "rt-canopy",
    name: "Canopy Suite",
    slug: "canopy-suite",
    description: "Spacious suite with nature-facing light and a quiet lounge corner.",
    maxGuests: 2,
    beds: "King bed",
    baseRate: 9800,
    amenities: ["Balcony", "Rain shower", "Workspace", "Mini pantry"],
    image: "/images/canopy-suite.png",
  },
  {
    id: "rt-mist",
    name: "Mist Cottage",
    slug: "mist-cottage",
    description: "Freestanding cottage with porch seating and garden path access.",
    maxGuests: 3,
    beds: "Queen + daybed",
    baseRate: 8500,
    amenities: ["Private porch", "Lounge nook", "Heated floors"],
    image: "/images/mist-cottage.png",
  },
  {
    id: "rt-leaf",
    name: "Leaf Room",
    slug: "leaf-room",
    description: "Calm lodge room with reading chair and canopy window seat.",
    maxGuests: 2,
    beds: "Queen bed",
    baseRate: 6200,
    amenities: ["Window seat", "Reading chair", "Organic toiletries"],
    image: "/images/leaf-room.png",
  },
];

export const roomUnits: RoomUnit[] = [
  { id: "ru-c1", code: "CS-01", roomTypeId: "rt-canopy", floor: "1", status: "available", housekeeping: "clean" },
  { id: "ru-c2", code: "CS-02", roomTypeId: "rt-canopy", floor: "1", status: "ready", housekeeping: "inspected" },
  { id: "ru-m1", code: "MC-01", roomTypeId: "rt-mist", floor: "G", status: "available", housekeeping: "clean" },
  { id: "ru-m2", code: "MC-02", roomTypeId: "rt-mist", floor: "G", status: "dirty", housekeeping: "dirty" },
  { id: "ru-l1", code: "LR-01", roomTypeId: "rt-leaf", floor: "2", status: "available", housekeeping: "clean" },
  { id: "ru-l2", code: "LR-02", roomTypeId: "rt-leaf", floor: "2", status: "cleaning", housekeeping: "in_progress" },
];

export const guests: Guest[] = [
  {
    id: "g-1",
    fullName: "Ananya Rao",
    email: "ananya@example.com",
    phone: "+91 90000 00001",
    address: "Bengaluru",
    createdAt: new Date().toISOString(),
  },
];

export const addons: Addon[] = [
  { id: "ad-breakfast", name: "Breakfast", price: 850, active: true },
  { id: "ad-extrabed", name: "Extra bed", price: 1500, active: true },
  { id: "ad-meals", name: "Meals package", price: 2200, active: true },
  { id: "ad-activity", name: "Guided activity", price: 1800, active: true },
];

export const offers: Offer[] = [
  {
    id: "of-1",
    title: "Weekday Soft Stay",
    description: "Sample midweek offer for demo pricing rules.",
    discountPercent: 10,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    active: true,
    code: "LEAF10",
  },
];

export const bookings: Booking[] = [];
export const payments: PaymentRecord[] = [];
export const invoices: Invoice[] = [];
