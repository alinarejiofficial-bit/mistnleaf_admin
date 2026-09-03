import type { CmsContent, CmsRoomContent } from "@/lib/cms-data";
import { loadCmsContent } from "@/lib/cms-storage";
import type { Room } from "@/lib/rooms";
import type { StaffRoom, StaffRoomType } from "@/lib/staff-api-client";

export const OPS_ROOMS_STORAGE_KEY = "mistnleaf_ops_rooms";

export async function fetchCmsRoomsForInventory(
  roleId?: string | null,
  userId?: string | null,
): Promise<CmsRoomContent[]> {
  if (typeof window !== "undefined" && roleId && userId) {
    try {
      const response = await fetch(`${window.location.origin}/api/cms/content/`, {
        headers: {
          "X-Mistnleaf-Role-Id": roleId,
          "X-Mistnleaf-User-Id": userId,
        },
        cache: "no-store",
      });
      if (response.ok) {
        const payload = (await response.json()) as { content?: CmsContent };
        if (payload.content?.rooms?.length) return payload.content.rooms;
      }
    } catch {
      // fall through to local CMS cache
    }
  }
  return loadCmsContent().rooms ?? [];
}

export function roomToStaffRoom(room: Room): StaffRoom {
  return {
    id: room.id,
    code: room.number,
    number: room.number,
    name: room.name,
    display_name: room.name,
    room_type_id: room.type,
    room_type_name: room.type,
    room_type_slug: room.type.toLowerCase().replace(/\s+/g, "-"),
    type: room.type,
    floor: String(room.floor),
    capacity: room.capacity,
    beds: room.beds,
    rate: room.rate,
    sizeSqFt: room.sizeSqFt,
    amenities: room.amenities,
    imageUrl: room.imageUrl,
    status: room.status,
    dashboardStatus: room.status,
    housekeeping_status: room.status === "Cleaning" ? "Dirty" : "Clean",
    notes: room.notes,
    guest: room.guest,
    reservationId: room.reservationId ?? null,
    is_active: true,
  };
}

export function loadLocalOpsRooms(): Room[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OPS_ROOMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Room[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalOpsRooms(rooms: Room[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OPS_ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch {
    // ignore quota errors
  }
}

function cmsRoomToInventory(cms: CmsRoomContent, index: number): Room {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: cms.id.startsWith("RM-") ? cms.id : `CMS-${cms.id}`,
    number,
    name: cms.name,
    type: cms.name,
    floor: 1,
    capacity: cms.capacity || 2,
    beds: "",
    rate: cms.priceFrom || 0,
    sizeSqFt: 0,
    amenities: cms.amenities ?? [],
    status: "Available",
    imageUrl: cms.images?.[0] || "",
    notes: cms.tagline || undefined,
  };
}

function roomNameKey(room: Pick<Room, "name" | "type">) {
  return `${room.name}`.trim().toLowerCase();
}

/** Merge API/seed inventory with locally added rooms and CMS website rooms. */
export function buildOpsRoomInventory(
  apiRooms: Room[],
  cmsRooms: CmsRoomContent[] = loadCmsContent().rooms ?? [],
): Room[] {
  const base = apiRooms;
  const byId = new Map<string, Room>();
  const knownNames = new Set<string>();

  for (const room of base) {
    byId.set(room.id, room);
    knownNames.add(roomNameKey(room));
    knownNames.add(room.type.trim().toLowerCase());
  }

  for (const room of loadLocalOpsRooms()) {
    byId.set(room.id, room);
    knownNames.add(roomNameKey(room));
    knownNames.add(room.type.trim().toLowerCase());
  }

  let nextIndex = byId.size;
  for (const cms of cmsRooms) {
    const nameKey = cms.name.trim().toLowerCase();
    const inventoryId = cms.id.startsWith("RM-") ? cms.id : `CMS-${cms.id}`;
    if (byId.has(inventoryId) || byId.has(cms.id)) continue;
    if (knownNames.has(nameKey)) continue;

    const room = cmsRoomToInventory(cms, nextIndex);
    nextIndex += 1;
    byId.set(room.id, room);
    knownNames.add(nameKey);
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.number.localeCompare(b.number, undefined, { numeric: true }),
  );
}

export function roomTypesFromRooms(rooms: Room[]): StaffRoomType[] {
  const seen = new Map<string, StaffRoomType>();
  for (const room of rooms) {
    const key = room.type.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.set(key, {
      id: key,
      name: room.type,
      slug: key.replace(/\s+/g, "-"),
      beds: room.beds,
      base_rate: room.rate,
      size_sq_ft: room.sizeSqFt,
      amenities: room.amenities,
      image: room.imageUrl || "",
      unit_count: 1,
    });
  }
  return Array.from(seen.values());
}

export function upsertLocalOpsRoom(room: Room) {
  const current = loadLocalOpsRooms();
  const next = current.some((item) => item.id === room.id)
    ? current.map((item) => (item.id === room.id ? room : item))
    : [...current, room];
  saveLocalOpsRooms(next);
  return next;
}
