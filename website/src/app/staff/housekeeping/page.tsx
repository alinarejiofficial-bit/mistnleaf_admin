import { redirect } from "next/navigation";
import { housekeepingAction } from "@/app/staff/actions";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { db } from "@/lib/store/db";

export default async function HousekeepingPage() {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "housekeeping")) redirect("/staff?denied=1");
  const store = db();

  return (
    <div>
      <h1 className="font-display text-3xl text-[#1f332b]">Housekeeping</h1>
      <p className="mt-2 text-sm text-[#667069]">
        Track cleaning status per room unit. Checkout marks rooms dirty; Clean or
        Inspected returns them to available inventory.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {store.roomUnits.map((unit) => {
          const type = store.roomTypes.find((t) => t.id === unit.roomTypeId);
          return (
            <div key={unit.id} className="border border-[#d7dbd6] bg-white p-5">
              <p className="font-display text-2xl text-[#1f332b]">{unit.code}</p>
              <p className="text-sm text-[#667069]">{type?.name}</p>
              <p className="mt-2 text-sm capitalize">
                HK: {unit.housekeeping.replace("_", " ")} · Room: {unit.status}
              </p>
              <form action={housekeepingAction} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="unitId" value={unit.id} />
                {(["dirty", "in_progress", "clean", "inspected"] as const).map((status) => (
                  <button
                    key={status}
                    type="submit"
                    name="status"
                    value={status}
                    className="border border-[#d7dbd6] px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-[#f3f4f2]"
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
