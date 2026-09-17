import { Suspense } from "react";
import { RoomsManager } from "@/components/rooms/RoomsManager";

export const metadata = { title: "Rooms" };

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading rooms…</div>}>
      <RoomsManager />
    </Suspense>
  );
}
