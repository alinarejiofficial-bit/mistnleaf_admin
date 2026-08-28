"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyticsSeries, formatINR } from "@/lib/data";

export function AnalyticsChart() {
  return (
    <section className="animate-fade-up-delay-3 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">
            Booking &amp; Revenue Analytics
          </h2>
          <p className="mt-1 text-sm text-muted">Last 7 days performance</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-lg bg-brand-soft px-2.5 py-1 font-medium text-brand">
            Bookings
          </span>
          <span className="rounded-lg bg-accent-soft px-2.5 py-1 font-medium text-[#8a6a2f]">
            Revenue
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analyticsSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f6b56" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#2f6b56" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b8956a" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#b8956a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              width={36}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              width={56}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
              }}
              formatter={(value, name) => {
                const numeric = typeof value === "number" ? value : Number(value ?? 0);
                if (name === "revenue") return [formatINR(numeric), "Revenue"];
                return [numeric, "Bookings"];
              }}
            />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs text-muted capitalize">{value}</span>
              )}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="bookings"
              stroke="#2f6b56"
              strokeWidth={2.25}
              fill="url(#bookingsFill)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#b8956a"
              strokeWidth={2.25}
              fill="url(#revenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
