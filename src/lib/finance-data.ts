import { dashboardSummary, formatINR, revenueOverview } from "@/lib/data";

export type FinancePaymentMethod =
  | "Online Gateway"
  | "UPI"
  | "Card"
  | "Net Banking"
  | "Cash"
  | "Bank Transfer";

export type FinancePaymentStatus =
  | "Pending"
  | "Partially Paid"
  | "Paid"
  | "Refunded"
  | "Failed"
  | "Cancelled";

export type FinancePayment = {
  id: string;
  reference: string;
  bookingId: string;
  guest: string;
  method: FinancePaymentMethod;
  channel: "Online" | "Offline";
  amount: number;
  status: FinancePaymentStatus;
  date: string;
  room?: string;
};

export type FinanceRefund = {
  id: string;
  paymentId: string;
  bookingId: string;
  guest: string;
  amount: number;
  reason: string;
  status: "Processed" | "Pending" | "Failed";
  processedOn: string;
  method: FinancePaymentMethod;
};

export type FinanceInvoiceDetail = {
  id: string;
  bookingRef: string;
  guest: string;
  room: string;
  checkIn: string;
  checkOut: string;
  charges: number;
  discounts: number;
  taxes: number;
  total: number;
  paid: number;
  balance: number;
  status: "Paid" | "Unpaid" | "Overdue" | "Draft";
  issuedOn: string;
  dueOn: string;
};

export const financeSummary = {
  totalRevenue: 2847600,
  todaysRevenue: dashboardSummary.todaysRevenue,
  monthlyRevenue: dashboardSummary.monthlyRevenue,
  pendingPayments: 5,
  partiallyPaidBookings: 3,
  outstandingBalances: 142800,
  refundedPayments: 2,
  failedPayments: 1,
};

export const financePayments: FinancePayment[] = [
  {
    id: "PAY-901",
    reference: "TXN-8829410",
    bookingId: "RSV-2041",
    guest: "Ananya Sharma",
    method: "UPI",
    channel: "Online",
    amount: 18600,
    status: "Paid",
    date: "2026-08-19",
    room: "Leaf Suite 03",
  },
  {
    id: "PAY-902",
    reference: "TXN-8829402",
    bookingId: "RSV-2038",
    guest: "Priya Nair",
    method: "Card",
    channel: "Online",
    amount: 15000,
    status: "Partially Paid",
    date: "2026-08-18",
    room: "Canopy King 12",
  },
  {
    id: "PAY-903",
    reference: "TXN-8830101",
    bookingId: "RSV-2042",
    guest: "Rahul Mehta",
    method: "Online Gateway",
    channel: "Online",
    amount: 9800,
    status: "Pending",
    date: "2026-08-20",
    room: "Mist Twin 09",
  },
  {
    id: "PAY-904",
    reference: "TXN-8830155",
    bookingId: "RSV-2033",
    guest: "Meera Iyer",
    method: "Cash",
    channel: "Offline",
    amount: 15400,
    status: "Paid",
    date: "2026-08-20",
    room: "Garden Deluxe 08",
  },
  {
    id: "PAY-905",
    reference: "TXN-8828200",
    bookingId: "RSV-2045",
    guest: "James Carter",
    method: "Net Banking",
    channel: "Online",
    amount: 31200,
    status: "Paid",
    date: "2026-08-17",
    room: "Leaf Suite 01",
  },
  {
    id: "PAY-906",
    reference: "TXN-8827100",
    bookingId: "RSV-2030",
    guest: "Arjun Desai",
    method: "UPI",
    channel: "Online",
    amount: 9600,
    status: "Refunded",
    date: "2026-08-15",
    room: "Mist Twin 16",
  },
  {
    id: "PAY-907",
    reference: "TXN-8829408",
    bookingId: "RSV-2039",
    guest: "Leo Fernandes",
    method: "Bank Transfer",
    channel: "Offline",
    amount: 5000,
    status: "Paid",
    date: "2026-08-19",
    room: "Canopy King 18",
  },
  {
    id: "PAY-908",
    reference: "TXN-8830200",
    bookingId: "RSV-2047",
    guest: "Nisha Rao",
    method: "Card",
    channel: "Online",
    amount: 22400,
    status: "Failed",
    date: "2026-08-20",
    room: "Garden Deluxe 14",
  },
  {
    id: "PAY-909",
    reference: "TXN-8830210",
    bookingId: "RSV-2048",
    guest: "Vikram Singh",
    method: "Online Gateway",
    channel: "Online",
    amount: 12800,
    status: "Cancelled",
    date: "2026-08-19",
    room: "Mist Twin 04",
  },
];

export const financeRefunds: FinanceRefund[] = [
  {
    id: "REF-101",
    paymentId: "PAY-906",
    bookingId: "RSV-2030",
    guest: "Arjun Desai",
    amount: 9600,
    reason: "Guest cancelled within policy window",
    status: "Processed",
    processedOn: "2026-08-16",
    method: "UPI",
  },
  {
    id: "REF-102",
    paymentId: "PAY-910",
    bookingId: "RSV-2035",
    guest: "Emily Chen",
    amount: 6200,
    reason: "Duplicate charge — front desk error",
    status: "Pending",
    processedOn: "2026-08-20",
    method: "Card",
  },
];

export const financeInvoices: FinanceInvoiceDetail[] = [
  {
    id: "INV-501",
    bookingRef: "RSV-2041",
    guest: "Ananya Sharma",
    room: "Leaf Suite 03",
    checkIn: "2026-08-19",
    checkOut: "2026-08-22",
    charges: 16800,
    discounts: 0,
    taxes: 1800,
    total: 18600,
    paid: 18600,
    balance: 0,
    status: "Paid",
    issuedOn: "2026-08-19",
    dueOn: "2026-08-20",
  },
  {
    id: "INV-502",
    bookingRef: "RSV-2038",
    guest: "Priya Nair",
    room: "Canopy King 12",
    checkIn: "2026-08-18",
    checkOut: "2026-08-21",
    charges: 24800,
    discounts: 1200,
    taxes: 2600,
    total: 27400,
    paid: 15000,
    balance: 12400,
    status: "Unpaid",
    issuedOn: "2026-08-19",
    dueOn: "2026-08-24",
  },
  {
    id: "INV-503",
    bookingRef: "RSV-2042",
    guest: "Rahul Mehta",
    room: "Mist Twin 09",
    checkIn: "2026-08-20",
    checkOut: "2026-08-21",
    charges: 8800,
    discounts: 0,
    taxes: 1000,
    total: 9800,
    paid: 0,
    balance: 9800,
    status: "Draft",
    issuedOn: "2026-08-20",
    dueOn: "2026-08-20",
  },
  {
    id: "INV-504",
    bookingRef: "RSV-2028",
    guest: "The Kapoor Family",
    room: "Leaf Suite 01",
    checkIn: "2026-08-15",
    checkOut: "2026-08-20",
    charges: 44500,
    discounts: 2500,
    taxes: 4500,
    total: 49000,
    paid: 35000,
    balance: 14000,
    status: "Overdue",
    issuedOn: "2026-08-15",
    dueOn: "2026-08-20",
  },
  {
    id: "INV-505",
    bookingRef: "RSV-2045",
    guest: "James Carter",
    room: "Leaf Suite 01",
    checkIn: "2026-08-17",
    checkOut: "2026-08-20",
    charges: 28200,
    discounts: 0,
    taxes: 3000,
    total: 31200,
    paid: 31200,
    balance: 0,
    status: "Paid",
    issuedOn: "2026-08-17",
    dueOn: "2026-08-21",
  },
];

export const financeReportKpis = [
  { label: "Daily revenue", value: formatINR(financeSummary.todaysRevenue) },
  { label: "Monthly revenue", value: formatINR(financeSummary.monthlyRevenue) },
  { label: "Room revenue", value: formatINR(1624000) },
  { label: "Add-on revenue", value: formatINR(284600) },
  { label: "Online payments", value: formatINR(1982400) },
  { label: "Offline payments", value: formatINR(865200) },
];

export const revenueByPaymentMethod = [
  { label: "UPI", amount: 624000 },
  { label: "Card", amount: 518000 },
  { label: "Online Gateway", amount: 412000 },
  { label: "Net Banking", amount: 428400 },
  { label: "Cash", amount: 312000 },
  { label: "Bank Transfer", amount: 553200 },
];

export const outstandingPaymentReport = [
  { booking: "RSV-2028", guest: "The Kapoor Family", balance: 14000, due: "2026-08-20" },
  { booking: "RSV-2038", guest: "Priya Nair", balance: 12400, due: "2026-08-24" },
  { booking: "RSV-2042", guest: "Rahul Mehta", balance: 9800, due: "2026-08-20" },
];

export const paymentStatusReport = [
  { status: "Paid", count: 42, amount: 2184000 },
  { status: "Partially Paid", count: 3, amount: 37200 },
  { status: "Pending", count: 5, amount: 68400 },
  { status: "Refunded", count: 2, amount: 15800 },
  { status: "Failed", count: 1, amount: 22400 },
  { status: "Cancelled", count: 1, amount: 12800 },
];

export { revenueOverview, formatINR };

export const financePaymentMethods: FinancePaymentMethod[] = [
  "Online Gateway",
  "UPI",
  "Card",
  "Net Banking",
  "Cash",
  "Bank Transfer",
];

export const financePaymentStatuses: FinancePaymentStatus[] = [
  "Pending",
  "Partially Paid",
  "Paid",
  "Refunded",
  "Failed",
  "Cancelled",
];

export const financeStatusStyles: Record<FinancePaymentStatus, string> = {
  Pending: "bg-accent-soft text-[#8a6a2f]",
  "Partially Paid": "bg-[#e7f0f5] text-info",
  Paid: "bg-[#e8f3ec] text-success",
  Refunded: "bg-surface-muted text-muted",
  Failed: "bg-[#f8e9e6] text-danger",
  Cancelled: "bg-surface-muted text-muted line-through",
};

export const refundStatusStyles = {
  Processed: "bg-[#e8f3ec] text-success",
  Pending: "bg-accent-soft text-[#8a6a2f]",
  Failed: "bg-[#f8e9e6] text-danger",
};

export const invoiceStatusStyles = {
  Paid: "bg-[#e8f3ec] text-success",
  Unpaid: "bg-accent-soft text-[#8a6a2f]",
  Overdue: "bg-[#f8e9e6] text-danger",
  Draft: "bg-surface-muted text-muted",
};
