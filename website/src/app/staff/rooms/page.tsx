import { redirect } from "next/navigation";
import { updateRoomTypeRateAction } from "@/app/staff/actions";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { db } from "@/lib/store/db";
import { formatInr } from "@/lib/utils";

export default async function StaffRoomsPage() {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "rooms")) redirect("/staff?denied=1");
  const store = db();

  return (
    <div>
      <h1 className="font-display text-3xl text-[#1f332b]">Rooms & types</h1>
      <p className="mt-2 text-sm text-[#667069]">
        Manage room types, base rates, and live unit status. Double-booking is blocked at reservation time.
      </p>

      <h2 className="mt-10 text-sm uppercase tracking-[0.14em] text-[#667069]">
        Room types / pricing
      </h2>
      <div className="mt-4 space-y-4">
        {store.roomTypes.map((type) => (
          <div key={type.id} className="border border-[#d7dbd6] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl text-[#1f332b]">{type.name}</p>
                <p className="mt-1 text-sm text-[#667069]">{type.description}</p>
                <p className="mt-2 text-sm">
                  Max {type.maxGuests} · {type.beds} · Current rate {formatInr(type.baseRate)}
                </p>
              </div>
              {user.role === "management" || user.role === "front_desk" ? (
                <form action={updateRoomTypeRateAction} className="flex items-end gap-2">
                  <input type="hidden" name="roomTypeId" value={type.id} />
                  <label className="text-xs uppercase tracking-[0.12em] text-[#667069]">
                    Base rate
                    <input
                      name="baseRate"
                      type="number"
                      defaultValue={type.baseRate}
                      className="mt-1 block w-32 border border-[#d7dbd6] px-2 py-1.5 text-sm"
                    />
                  </label>
                  <button type="submit" className="bg-[#1f332b] px-3 py-2 text-xs uppercase tracking-wide text-white">
                    Save
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm uppercase tracking-[0.14em] text-[#667069]">
        Units · real-time status
      </h2>
      <div className="mt-4 overflow-x-auto border border-[#d7dbd6] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#d7dbd6] bg-[#f3f4f2] text-xs uppercase tracking-[0.12em] text-[#667069]">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Floor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Housekeeping</th>
            </tr>
          </thead>
          <tbody>
            {store.roomUnits.map((unit) => {
              const type = store.roomTypes.find((t) => t.id === unit.roomTypeId);
              return (
                <tr key={unit.id} className="border-b border-[#d7dbd6]/70">
                  <td className="px-4 py-3 font-medium">{unit.code}</td>
                  <td className="px-4 py-3">{type?.name}</td>
                  <td className="px-4 py-3">{unit.floor}</td>
                  <td className="px-4 py-3 capitalize">{unit.status}</td>
                  <td className="px-4 py-3 capitalize">{unit.housekeeping.replace("_", " ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
