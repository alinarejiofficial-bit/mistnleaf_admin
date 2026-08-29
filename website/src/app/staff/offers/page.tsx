import { redirect } from "next/navigation";
import { toggleOfferAction } from "@/app/staff/actions";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { db } from "@/lib/store/db";

export default async function StaffOffersPage() {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "offers")) redirect("/staff?denied=1");
  const store = db();

  return (
    <div>
      <h1 className="font-display text-3xl text-[#1f332b]">Offers & pricing rules</h1>
      <p className="mt-2 text-sm text-[#667069]">
        Manage promotional offers. Room base rates are edited under Rooms.
      </p>
      <div className="mt-8 space-y-4">
        {store.offers.map((offer) => (
          <div key={offer.id} className="border border-[#d7dbd6] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl text-[#1f332b]">{offer.title}</p>
                <p className="mt-1 text-sm text-[#667069]">{offer.description}</p>
                <p className="mt-2 text-sm">
                  Code <strong>{offer.code}</strong> · {offer.discountPercent}% ·{" "}
                  {offer.validFrom} → {offer.validTo} ·{" "}
                  {offer.active ? "Active" : "Inactive"}
                </p>
              </div>
              <form action={toggleOfferAction}>
                <input type="hidden" name="offerId" value={offer.id} />
                <button type="submit" className="border border-[#d7dbd6] px-3 py-2 text-xs uppercase tracking-wide">
                  {offer.active ? "Deactivate" : "Activate"}
                </button>
              </form>
            </div>
          </div>
        ))}
        <div className="border border-dashed border-[#d7dbd6] bg-white px-5 py-8 text-sm text-[#667069]">
          Add-ons catalog: {store.addons.map((a) => `${a.name} (${a.price})`).join(" · ")}
        </div>
      </div>
    </div>
  );
}
