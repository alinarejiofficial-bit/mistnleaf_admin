import { formatINR } from "@/lib/data";
import { reservations } from "@/lib/reservations";
import { rooms } from "@/lib/rooms";

export { formatINR };

export type Guest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  stays: number;
  lastStay: string;
  totalSpend: number;
  status: "Active" | "VIP" | "Blacklisted";
  notes?: string;
};

export type CalendarCell = {
  room: string;
  days: Array<"free" | "occupied" | "reserved" | "blocked">;
};

export type HousekeepingTask = {
  id: string;
  room: string;
  type: "Checkout clean" | "Stayover" | "Deep clean" | "Turndown";
  assignee: string;
  priority: "High" | "Medium" | "Low";
  status: "Queued" | "In progress" | "Done";
  due: string;
};

export type MaintenanceTicket = {
  id: string;
  room: string;
  issue: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In progress" | "Resolved";
  reportedBy: string;
  reportedAt: string;
};

export type Payment = {
  id: string;
  guest: string;
  reservationId: string;
  method: "UPI" | "Card" | "Cash" | "Bank transfer";
  channel: "Online" | "Offline";
  amount: number;
  status: "Success" | "Pending" | "Failed" | "Refunded";
  date: string;
};

export type Invoice = {
  id: string;
  guest: string;
  reservationId: string;
  issuedOn: string;
  dueOn: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Overdue" | "Draft";
};

export type Offer = {
  id: string;
  title: string;
  code: string;
  discount: string;
  validFrom: string;
  validTo: string;
  status: "Active" | "Scheduled" | "Expired";
  usage: number;
};

export type AddOn = {
  id: string;
  name: string;
  category: "Spa" | "Transport" | "Dining" | "Experience";
  price: number;
  status: "Active" | "Inactive";
  bookings: number;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  channel: "Website" | "Phone" | "Email";
  status: "New" | "In progress" | "Closed";
  receivedAt: string;
};

export type AppNotification = import("@/lib/notifications").AppNotification;

export { allNotifications as notifications } from "@/lib/notifications";

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  status: "Published" | "Draft";
  updatedAt: string;
};

export const guests: Guest[] = [
  {
    id: "GST-101",
    name: "Ananya Sharma",
    email: "ananya.sharma@email.com",
    phone: "+91 98765 41021",
    nationality: "India",
    stays: 4,
    lastStay: "2026-08-20",
    totalSpend: 74200,
    status: "VIP",
  },
  {
    id: "GST-102",
    name: "Rahul Mehta",
    email: "rahul.mehta@email.com",
    phone: "+91 98200 11844",
    nationality: "India",
    stays: 1,
    lastStay: "2026-08-20",
    totalSpend: 9800,
    status: "Active",
  },
  {
    id: "GST-103",
    name: "Priya Nair",
    email: "priya.nair@email.com",
    phone: "+91 97654 22018",
    nationality: "India",
    stays: 3,
    lastStay: "2026-08-19",
    totalSpend: 61200,
    status: "VIP",
  },
  {
    id: "GST-104",
    name: "James Carter",
    email: "james.carter@email.com",
    phone: "+1 415 882 4410",
    nationality: "USA",
    stays: 2,
    lastStay: "2026-08-21",
    totalSpend: 54800,
    status: "Active",
  },
  {
    id: "GST-105",
    name: "Hiroshi Tanaka",
    email: "h.tanaka@email.com",
    phone: "+81 90 1122 8899",
    nationality: "Japan",
    stays: 5,
    lastStay: "2026-08-18",
    totalSpend: 128400,
    status: "VIP",
  },
  {
    id: "GST-106",
    name: "Meera Iyer",
    email: "meera.iyer@email.com",
    phone: "+91 99001 33455",
    nationality: "India",
    stays: 2,
    lastStay: "2026-08-20",
    totalSpend: 28600,
    status: "Active",
  },
  {
    id: "GST-107",
    name: "Nora Ellis",
    email: "nora.ellis@email.com",
    phone: "+44 7700 900123",
    nationality: "UK",
    stays: 1,
    lastStay: "2026-08-22",
    totalSpend: 30400,
    status: "Active",
  },
  {
    id: "GST-108",
    name: "Arjun Desai",
    email: "arjun.desai@email.com",
    phone: "+91 97222 88001",
    nationality: "India",
    stays: 0,
    lastStay: "—",
    totalSpend: 0,
    status: "Blacklisted",
    notes: "Repeated no-shows",
  },
];

export const today = "2026-08-20";

export const checkInQueue = reservations.filter(
  (r) =>
    r.checkIn === today &&
    (r.status === "Confirmed" || r.status === "Pending"),
);

export const checkOutQueue = reservations.filter(
  (r) =>
    (r.checkOut === today || r.checkOut === "2026-08-21") &&
    (r.status === "Checked-in" || r.status === "Checked-out"),
);

export const calendarDays = ["20", "21", "22", "23", "24", "25", "26"];

export const calendarGrid: CalendarCell[] = rooms.slice(0, 12).map((room) => {
  const pattern: CalendarCell["days"] = [];
  for (let i = 0; i < 7; i += 1) {
    if (room.status === "Maintenance") pattern.push("blocked");
    else if (room.status === "Occupied") pattern.push(i < 4 ? "occupied" : "free");
    else if (room.status === "Reserved") pattern.push(i < 2 ? "reserved" : "free");
    else if (room.status === "Cleaning") pattern.push(i === 0 ? "blocked" : "free");
    else pattern.push(i === 3 || i === 4 ? "reserved" : "free");
  }
  return { room: room.name, days: pattern };
});

export const housekeepingTasks: HousekeepingTask[] = [
  {
    id: "HK-01",
    room: "Leaf Suite 03",
    type: "Checkout clean",
    assignee: "Sofia Fernandes",
    priority: "High",
    status: "In progress",
    due: "Today 12:00",
  },
  {
    id: "HK-02",
    room: "Mist Twin 09",
    type: "Checkout clean",
    assignee: "Sofia Fernandes",
    priority: "High",
    status: "Queued",
    due: "Today 13:00",
  },
  {
    id: "HK-03",
    room: "Mist Twin 16",
    type: "Stayover",
    assignee: "Ravi Kumar",
    priority: "Medium",
    status: "Queued",
    due: "Today 15:00",
  },
  {
    id: "HK-04",
    room: "Mist Twin 23",
    type: "Deep clean",
    assignee: "Ravi Kumar",
    priority: "Medium",
    status: "Done",
    due: "Yesterday",
  },
  {
    id: "HK-05",
    room: "Garden Deluxe 08",
    type: "Turndown",
    assignee: "Anita D'Souza",
    priority: "Low",
    status: "Queued",
    due: "Today 18:00",
  },
  {
    id: "HK-06",
    room: "Canopy King 15",
    type: "Stayover",
    assignee: "Anita D'Souza",
    priority: "Medium",
    status: "In progress",
    due: "Today 14:30",
  },
];

export const maintenanceTickets: MaintenanceTicket[] = [
  {
    id: "MT-11",
    room: "Canopy King 10",
    issue: "AC compressor replacement",
    priority: "Critical",
    status: "In progress",
    reportedBy: "Housekeeping",
    reportedAt: "2026-08-19",
  },
  {
    id: "MT-12",
    room: "Canopy King 24",
    issue: "Plumbing leak under bathroom sink",
    priority: "High",
    status: "Open",
    reportedBy: "Front Desk",
    reportedAt: "2026-08-20",
  },
  {
    id: "MT-13",
    room: "Garden Deluxe 05",
    issue: "TV remote not pairing",
    priority: "Low",
    status: "Resolved",
    reportedBy: "Guest",
    reportedAt: "2026-08-18",
  },
  {
    id: "MT-14",
    room: "Leaf Suite 11",
    issue: "Balcony door lock stiff",
    priority: "Medium",
    status: "Open",
    reportedBy: "Housekeeping",
    reportedAt: "2026-08-20",
  },
];

export const payments: Payment[] = [
  {
    id: "PAY-901",
    guest: "Ananya Sharma",
    reservationId: "RSV-2041",
    method: "UPI",
    channel: "Online",
    amount: 18600,
    status: "Success",
    date: "2026-08-19",
  },
  {
    id: "PAY-902",
    guest: "Priya Nair",
    reservationId: "RSV-2038",
    method: "Card",
    channel: "Online",
    amount: 15000,
    status: "Success",
    date: "2026-08-18",
  },
  {
    id: "PAY-903",
    guest: "Rahul Mehta",
    reservationId: "RSV-2042",
    method: "Card",
    channel: "Online",
    amount: 9800,
    status: "Pending",
    date: "2026-08-20",
  },
  {
    id: "PAY-904",
    guest: "Meera Iyer",
    reservationId: "RSV-2033",
    method: "Cash",
    channel: "Offline",
    amount: 15400,
    status: "Success",
    date: "2026-08-20",
  },
  {
    id: "PAY-905",
    guest: "James Carter",
    reservationId: "RSV-2045",
    method: "Card",
    channel: "Online",
    amount: 31200,
    status: "Success",
    date: "2026-08-17",
  },
  {
    id: "PAY-906",
    guest: "Arjun Desai",
    reservationId: "RSV-2030",
    method: "UPI",
    channel: "Online",
    amount: 9600,
    status: "Refunded",
    date: "2026-08-15",
  },
  {
    id: "PAY-907",
    guest: "Leo Fernandes",
    reservationId: "RSV-2039",
    method: "Cash",
    channel: "Offline",
    amount: 5000,
    status: "Success",
    date: "2026-08-19",
  },
  {
    id: "PAY-908",
    guest: "Nora Ellis",
    reservationId: "RSV-2047",
    method: "Bank transfer",
    channel: "Offline",
    amount: 11200,
    status: "Pending",
    date: "2026-08-20",
  },
];

export const invoices: Invoice[] = [
  {
    id: "INV-501",
    guest: "Ananya Sharma",
    reservationId: "RSV-2041",
    issuedOn: "2026-08-19",
    dueOn: "2026-08-20",
    amount: 18600,
    status: "Paid",
  },
  {
    id: "INV-502",
    guest: "Priya Nair",
    reservationId: "RSV-2038",
    issuedOn: "2026-08-19",
    dueOn: "2026-08-24",
    amount: 27400,
    status: "Unpaid",
  },
  {
    id: "INV-503",
    guest: "Rahul Mehta",
    reservationId: "RSV-2042",
    issuedOn: "2026-08-20",
    dueOn: "2026-08-20",
    amount: 9800,
    status: "Draft",
  },
  {
    id: "INV-504",
    guest: "The Kapoor Family",
    reservationId: "RSV-2028",
    issuedOn: "2026-08-15",
    dueOn: "2026-08-20",
    amount: 49000,
    status: "Overdue",
  },
  {
    id: "INV-505",
    guest: "James Carter",
    reservationId: "RSV-2045",
    issuedOn: "2026-08-17",
    dueOn: "2026-08-21",
    amount: 31200,
    status: "Paid",
  },
];

export const offers: Offer[] = [
  {
    id: "OFF-01",
    title: "Monsoon Escape",
    code: "MIST20",
    discount: "20% off 3+ nights",
    validFrom: "2026-08-01",
    validTo: "2026-09-15",
    status: "Active",
    usage: 42,
  },
  {
    id: "OFF-02",
    title: "Weekday Wellness",
    code: "LEAF15",
    discount: "15% + spa credit",
    validFrom: "2026-08-10",
    validTo: "2026-10-31",
    status: "Active",
    usage: 18,
  },
  {
    id: "OFF-03",
    title: "Festive Early Bird",
    code: "FEST25",
    discount: "25% on festive stays",
    validFrom: "2026-09-01",
    validTo: "2026-12-20",
    status: "Scheduled",
    usage: 0,
  },
  {
    id: "OFF-04",
    title: "Summer Splash",
    code: "SUMMER10",
    discount: "10% flat",
    validFrom: "2026-04-01",
    validTo: "2026-06-30",
    status: "Expired",
    usage: 96,
  },
];

export const addOns: AddOn[] = [
  {
    id: "ADD-01",
    name: "Couples Spa Ritual",
    category: "Spa",
    price: 6500,
    status: "Active",
    bookings: 28,
  },
  {
    id: "ADD-02",
    name: "Airport Transfer",
    category: "Transport",
    price: 2200,
    status: "Active",
    bookings: 61,
  },
  {
    id: "ADD-03",
    name: "Candlelight Dinner",
    category: "Dining",
    price: 4800,
    status: "Active",
    bookings: 19,
  },
  {
    id: "ADD-04",
    name: "Guided Nature Walk",
    category: "Experience",
    price: 1500,
    status: "Active",
    bookings: 34,
  },
  {
    id: "ADD-05",
    name: "Private Yoga Session",
    category: "Experience",
    price: 2800,
    status: "Inactive",
    bookings: 7,
  },
];

export const enquiries: Enquiry[] = [
  {
    id: "ENQ-01",
    name: "Ritu Malhotra",
    email: "ritu.m@email.com",
    subject: "Family suite availability for Diwali",
    channel: "Website",
    status: "New",
    receivedAt: "2026-08-20 09:12",
  },
  {
    id: "ENQ-02",
    name: "Corporate Desk — NovaTech",
    email: "travel@novatech.com",
    subject: "Group booking for 12 rooms",
    channel: "Email",
    status: "In progress",
    receivedAt: "2026-08-19 16:40",
  },
  {
    id: "ENQ-03",
    name: "Amit Joshi",
    email: "amit.j@email.com",
    subject: "Pet-friendly room enquiry",
    channel: "Phone",
    status: "Closed",
    receivedAt: "2026-08-18 11:05",
  },
  {
    id: "ENQ-04",
    name: "Elena Rossi",
    email: "elena.rossi@email.com",
    subject: "Honeymoon package details",
    channel: "Website",
    status: "New",
    receivedAt: "2026-08-20 14:22",
  },
];

export const cmsPages: CmsPage[] = [
  {
    id: "CMS-01",
    title: "Home",
    slug: "/",
    status: "Published",
    updatedAt: "2026-08-18",
  },
  {
    id: "CMS-02",
    title: "Rooms & Suites",
    slug: "/rooms",
    status: "Published",
    updatedAt: "2026-08-17",
  },
  {
    id: "CMS-03",
    title: "Offers",
    slug: "/offers",
    status: "Published",
    updatedAt: "2026-08-16",
  },
  {
    id: "CMS-04",
    title: "Experiences Blog",
    slug: "/blog",
    status: "Draft",
    updatedAt: "2026-08-20",
  },
  {
    id: "CMS-05",
    title: "Facilities",
    slug: "/facilities",
    status: "Published",
    updatedAt: "2026-08-12",
  },
];

export const reportCards = [
  { label: "Occupancy (MTD)", value: "71%" },
  { label: "ADR", value: formatINR(7800) },
  { label: "RevPAR", value: formatINR(5538) },
  { label: "Bookings MTD", value: "186" },
  { label: "Cancellations", value: "11" },
  { label: "Avg stay length", value: "3.2 nights" },
];
