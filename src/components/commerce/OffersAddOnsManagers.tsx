"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { addOns as initialAddOns, formatINR, offers as initialOffers, type AddOn, type Offer } from "@/lib/ops-data";
import { offersFromCms, addOnsFromCms } from "@/lib/ops-live";
import { fetchCmsContentFromApi, saveCmsContentToApi } from "@/lib/cms-api-client";
import type { CmsContent, CmsExperience, CmsWebsiteOffer } from "@/lib/cms-data";
import { formatDisplayDate } from "@/lib/data";
import { hasPermission } from "@/lib/roles";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

const offerStyles = {
  Active: "bg-[#e8f3ec] text-success",
  Scheduled: "bg-[#e7f0f5] text-info",
  Expired: "bg-surface-muted text-muted",
};

const offerStatuses: Offer["status"][] = ["Active", "Scheduled", "Expired"];

function toCmsOffer(offer: Offer, existing?: CmsWebsiteOffer, sortOrder = 0): CmsWebsiteOffer {
  return {
    id: offer.id,
    title: offer.title,
    code: offer.code,
    description: existing?.description || offer.title,
    details: existing?.details || "",
    discount: offer.discount,
    priceFrom: existing?.priceFrom ?? 0,
    priceLabel: existing?.priceLabel || "FROM",
    terms: existing?.terms ?? [],
    bookCtaLabel: existing?.bookCtaLabel || "Book package →",
    bookCtaHref: existing?.bookCtaHref || "#contact",
    sortOrder: existing?.sortOrder ?? sortOrder,
    validFrom: offer.validFrom,
    validTo: offer.validTo,
    active: offer.status === "Active",
    status: offer.status === "Expired" ? "Draft" : "Published",
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

function toCmsExperience(item: AddOn, existing?: CmsExperience, sortOrder = 0): CmsExperience {
  return {
    id: item.id,
    title: item.name,
    description: existing?.description || (item.price ? `From ₹${item.price}` : ""),
    duration: existing?.duration || "",
    imageUrl: existing?.imageUrl || "",
    sortOrder: existing?.sortOrder ?? sortOrder,
    status: item.status === "Active" ? "Published" : "Draft",
  };
}

async function persistOffersToCms(
  next: Offer[],
  user: { id: string; roleId: import("@/lib/roles").RoleId },
) {
  const content: CmsContent = await fetchCmsContentFromApi(user.roleId, user.id);
  const nextById = new Map(next.map((item) => [item.id, item]));
  const kept = content.offers.map((existing) => {
    const offer = nextById.get(existing.id);
    return offer ? toCmsOffer(offer, existing, existing.sortOrder) : existing;
  });
  const extras = next
    .filter((item) => !content.offers.some((offer) => offer.id === item.id))
    .map((item, index) => toCmsOffer(item, undefined, content.offers.length + index));
  await saveCmsContentToApi(
    { ...content, offers: [...kept, ...extras] },
    user.roleId,
    user.id,
  );
}

async function persistAddOnsToCms(
  next: AddOn[],
  user: { id: string; roleId: import("@/lib/roles").RoleId },
) {
  const content: CmsContent = await fetchCmsContentFromApi(user.roleId, user.id);
  const nextById = new Map(next.map((item) => [item.id, item]));
  const kept = content.experiences.map((existing) => {
    const addon = nextById.get(existing.id);
    return addon ? toCmsExperience(addon, existing, existing.sortOrder) : existing;
  });
  const extras = next
    .filter((item) => !content.experiences.some((exp) => exp.id === item.id))
    .map((item, index) => toCmsExperience(item, undefined, content.experiences.length + index));
  await saveCmsContentToApi(
    { ...content, experiences: [...kept, ...extras] },
    user.roleId,
    user.id,
  );
}

const emptyOfferForm = {
  title: "",
  code: "",
  discount: "",
  validFrom: "",
  validTo: "",
  status: "Scheduled" as Offer["status"],
  usage: "0",
};

const addOnStyles = {
  Active: "bg-[#e8f3ec] text-success",
  Inactive: "bg-surface-muted text-muted",
};

export function OffersManager() {
  const { currentUser } = useAuth();
  const canManageOffers = currentUser
    ? hasPermission(currentUser.roleId, "manage_offers")
    : false;

  const [items, setItems] = useState<Offer[]>(initialOffers);

  useEffect(() => {
    if (!currentUser) return;
    void fetchCmsContentFromApi(currentUser.roleId, currentUser.id)
      .then((content) => {
        const mapped = offersFromCms(content.offers);
        if (mapped.length) setItems(mapped);
      })
      .catch(() => undefined);
  }, [currentUser]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyOfferForm);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((offer) => offer.status === "Active").length,
      redemptions: items.reduce((sum, offer) => sum + offer.usage, 0),
    }),
    [items],
  );

  function openCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(emptyOfferForm);
    setError("");
  }

  function openEdit(offer: Offer) {
    setCreating(false);
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      code: offer.code,
      discount: offer.discount,
      validFrom: offer.validFrom,
      validTo: offer.validTo,
      status: offer.status,
      usage: String(offer.usage),
    });
    setError("");
  }

  function closeModal() {
    setEditingId(null);
    setCreating(false);
    setForm(emptyOfferForm);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    const code = form.code.trim().toUpperCase();
    const discount = form.discount.trim();
    const usage = Number(form.usage);

    if (!title || !code || !discount || !form.validFrom || !form.validTo) {
      setError("All fields except usage are required.");
      return;
    }

    if (form.validFrom > form.validTo) {
      setError("End date must be on or after the start date.");
      return;
    }

    if (Number.isNaN(usage) || usage < 0) {
      setError("Usage must be a valid non-negative number.");
      return;
    }

    const duplicate = items.find(
      (offer) =>
        offer.code.toUpperCase() === code &&
        offer.id !== editingId,
    );
    if (duplicate) {
      setError("Another offer already uses this code.");
      return;
    }

    const nextItem: Offer = creating
      ? {
          id: `cms-offer-${Date.now()}`,
          title,
          code,
          discount,
          validFrom: form.validFrom,
          validTo: form.validTo,
          status: form.status,
          usage,
        }
      : {
          id: editingId ?? "",
          title,
          code,
          discount,
          validFrom: form.validFrom,
          validTo: form.validTo,
          status: form.status,
          usage,
        };

    const next = creating
      ? [...items, nextItem]
      : items.map((offer) => (offer.id === editingId ? { ...offer, ...nextItem } : offer));

    setItems(next);
    if (currentUser) {
      try {
        await persistOffersToCms(next, currentUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save offer to the website.");
        return;
      }
    }

    closeModal();
  }

  const modalOpen = creating || editingId !== null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        description="Promotions, seasonal rates, and discount codes."
        action={
          canManageOffers ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              New offer
            </button>
          ) : null
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Offers" value={stats.total} />
        <StatPill label="Active" value={stats.active} tone="success" />
        <StatPill label="Total redemptions" value={stats.redemptions} tone="brand" />
      </div>
      <SectionCard title="Promotion catalogue">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Offer</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Validity</th>
                <th className="px-5 py-3 font-medium">Usage</th>
                <th className="px-5 py-3 font-medium">Status</th>
                {canManageOffers ? (
                  <th className="px-5 py-3 font-medium">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {items.map((offer) => (
                <tr key={offer.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5 font-medium">{offer.title}</td>
                  <td className="px-5 py-3.5">{offer.code}</td>
                  <td className="px-5 py-3.5">{offer.discount}</td>
                  <td className="px-5 py-3.5 text-muted">
                    {formatDisplayDate(offer.validFrom)} →{" "}
                    {formatDisplayDate(offer.validTo)}
                  </td>
                  <td className="px-5 py-3.5">{offer.usage}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={offerStyles[offer.status]}>{offer.status}</Badge>
                  </td>
                  {canManageOffers ? (
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => openEdit(offer)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={closeModal}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border-subtle bg-surface p-5 shadow-xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-foreground">
                  {creating ? "New offer" : "Edit offer"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Update promotion details, validity, and status.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-muted transition hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Offer name
                </span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="e.g. Monsoon Escape"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Promo code
                  </span>
                  <input
                    value={form.code}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, code: event.target.value }))
                    }
                    placeholder="MIST20"
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm uppercase outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Status
                  </span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        status: event.target.value as Offer["status"],
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                  >
                    {offerStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Discount
                </span>
                <input
                  value={form.discount}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, discount: event.target.value }))
                  }
                  placeholder="20% off 3+ nights"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Valid from
                  </span>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, validFrom: event.target.value }))
                    }
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Valid to
                  </span>
                  <input
                    type="date"
                    value={form.validTo}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, validTo: event.target.value }))
                    }
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Redemptions
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.usage}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, usage: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              {error ? (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
                >
                  <Pencil className="h-4 w-4" />
                  {creating ? "Create offer" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const addOnCategories: AddOn["category"][] = [
  "Spa",
  "Transport",
  "Dining",
  "Experience",
];

const emptyAddOnForm = {
  name: "",
  category: "Spa" as AddOn["category"],
  price: "",
  status: "Active" as AddOn["status"],
  bookings: "0",
};

export function AddOnsManager() {
  const { currentUser } = useAuth();
  const canManageAddOns = currentUser
    ? hasPermission(currentUser.roleId, "manage_addons")
    : false;

  const [items, setItems] = useState<AddOn[]>(initialAddOns);

  useEffect(() => {
    if (!currentUser) return;
    void fetchCmsContentFromApi(currentUser.roleId, currentUser.id)
      .then((content) => {
        const mapped = addOnsFromCms(content.experiences);
        if (mapped.length) setItems(mapped);
      })
      .catch(() => undefined);
  }, [currentUser]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyAddOnForm);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((item) => item.status === "Active").length,
      bookings: items.reduce((sum, item) => sum + item.bookings, 0),
    }),
    [items],
  );

  function openCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(emptyAddOnForm);
    setError("");
  }

  function openEdit(item: AddOn) {
    setCreating(false);
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      status: item.status,
      bookings: String(item.bookings),
    });
    setError("");
  }

  function closeModal() {
    setEditingId(null);
    setCreating(false);
    setForm(emptyAddOnForm);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const price = Number(form.price);
    const bookings = Number(form.bookings);

    if (!name) {
      setError("Name is required.");
      return;
    }

    if (Number.isNaN(price) || price <= 0) {
      setError("Price must be a valid amount greater than zero.");
      return;
    }

    if (Number.isNaN(bookings) || bookings < 0) {
      setError("Bookings must be a valid non-negative number.");
      return;
    }

    const nextItem: AddOn = creating
      ? {
          id: `cms-exp-${Date.now()}`,
          name,
          category: form.category,
          price,
          status: form.status,
          bookings,
        }
      : {
          id: editingId ?? "",
          name,
          category: form.category,
          price,
          status: form.status,
          bookings,
        };

    const next = creating
      ? [...items, nextItem]
      : items.map((item) => (item.id === editingId ? { ...item, ...nextItem } : item));

    setItems(next);
    if (currentUser) {
      try {
        await persistAddOnsToCms(next, currentUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save add-on to the website.");
        return;
      }
    }

    closeModal();
  }

  const modalOpen = creating || editingId !== null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add-ons"
        description="Extras such as spa, transfers, dining, and experiences."
        action={
          canManageAddOns ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              New add-on
            </button>
          ) : null
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Add-ons" value={stats.total} />
        <StatPill label="Active" value={stats.active} tone="success" />
        <StatPill label="Bookings" value={stats.bookings} tone="brand" />
      </div>
      <SectionCard title="Add-on catalogue">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Bookings</th>
                <th className="px-5 py-3 font-medium">Status</th>
                {canManageAddOns ? (
                  <th className="px-5 py-3 font-medium">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5 font-medium">{item.name}</td>
                  <td className="px-5 py-3.5">{item.category}</td>
                  <td className="px-5 py-3.5">{formatINR(item.price)}</td>
                  <td className="px-5 py-3.5">{item.bookings}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={addOnStyles[item.status]}>{item.status}</Badge>
                  </td>
                  {canManageAddOns ? (
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={closeModal}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border-subtle bg-surface p-5 shadow-xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-foreground">
                  {creating ? "New add-on" : "Edit add-on"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Update service details, pricing, and availability.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-muted transition hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Name
                </span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="e.g. Couples Spa Ritual"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Category
                  </span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        category: event.target.value as AddOn["category"],
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                  >
                    {addOnCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Status
                  </span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        status: event.target.value as AddOn["status"],
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Price (₹)
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, price: event.target.value }))
                    }
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Bookings
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.bookings}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, bookings: event.target.value }))
                    }
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                  />
                </label>
              </div>

              {error ? (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
                >
                  <Pencil className="h-4 w-4" />
                  {creating ? "Create add-on" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
