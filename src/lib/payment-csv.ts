import type { Payment } from "@/lib/ops-data";

export const PAYMENT_CSV_HEADERS = [
  "id",
  "reservationId",
  "guest",
  "method",
  "channel",
  "amount",
  "status",
  "date",
] as const;

function escapeCsvCell(value: string | number | undefined | null) {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function paymentStatusLabel(status: Payment["status"]) {
  if (status === "Success") return "Paid";
  return status;
}

export function paymentsToCsv(rows: Payment[]) {
  const lines = [
    PAYMENT_CSV_HEADERS.join(","),
    ...rows.map((payment) =>
      [
        payment.id,
        payment.reservationId,
        payment.guest,
        payment.method,
        payment.channel,
        payment.amount,
        paymentStatusLabel(payment.status),
        payment.date,
      ]
        .map(escapeCsvCell)
        .join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

export function downloadPaymentsCsv(rows: Payment[], filename?: string) {
  const csv = paymentsToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = filename ?? `mistnleaf-payments-${stamp}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
