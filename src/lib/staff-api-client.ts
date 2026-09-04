import type { RoleId } from "@/lib/roles";

const ACCESS_KEY = "mistnleaf_jwt_access";
const REFRESH_KEY = "mistnleaf_jwt_refresh";

/**
 * Django API base for auth + staff endpoints.
 * Always use 127.0.0.1 (not localhost) in local dev — Windows may route
 * localhost:3001 to a leftover Next.js public site on 0.0.0.0:3001 while
 * Django is bound only to 127.0.0.1:3001.
 */
export function getApiBase(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_CMS_API_URL?.replace(/\/$/, "");
  if (configured) {
    return configured
      .replace("://localhost:", "://127.0.0.1:")
      .replace("://[::1]:", "://127.0.0.1:");
  }
  return "http://127.0.0.1:3001";
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(access: string, refresh: string) {
  window.localStorage.setItem(ACCESS_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export type BackendUser = {
  id: string;
  email: string;
  name: string;
  role_id: RoleId;
  role_name: string;
  department: string;
  phone?: string;
  permissions: string[];
};

export type LoginResult = {
  access: string;
  refresh: string;
  user: BackendUser;
};

export async function loginToBackend(
  email: string,
  password: string,
): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBase()}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username: email, password }),
    });
  } catch {
    throw new Error(
      "Cannot reach the API on port 3001. Start Django with `python manage.py runserver 3001` and try again.",
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(formatApiError(body, response.status) || "Invalid email or password.");
  }

  const payload = (await response.json()) as LoginResult;
  if (!payload.access || !payload.refresh || !payload.user) {
    throw new Error("Login did not return API tokens. Check the Django auth endpoint.");
  }
  saveTokens(payload.access, payload.refresh);
  return payload;
}

export async function logoutFromBackend() {
  const refresh = getRefreshToken();
  clearTokens();
  if (!refresh) return;
  try {
    await fetch(`${getApiBase()}/api/auth/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    // ignore network errors on logout
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const response = await fetch(`${getApiBase()}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) {
      clearTokens();
      return null;
    }
    const payload = (await response.json()) as { access: string; refresh?: string };
    window.localStorage.setItem(ACCESS_KEY, payload.access);
    if (payload.refresh) {
      window.localStorage.setItem(REFRESH_KEY, payload.refresh);
    }
    return payload.access;
  } catch {
    clearTokens();
    return null;
  }
}

type StaffFetchOptions = {
  method?: string;
  body?: unknown;
  roleId?: RoleId;
  userId?: string;
  searchParams?: Record<string, string | undefined>;
};

function formatApiError(body: unknown, status: number): string {
  if (typeof body === "string" && body.trim()) return body;
  if (!body || typeof body !== "object") return `Request failed (${status})`;
  const obj = body as Record<string, unknown>;
  if (typeof obj.detail === "string") return obj.detail;
  if (Array.isArray(obj.detail)) {
    return obj.detail
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .join(" ");
  }
  if (typeof obj.error === "string") return obj.error;
  const parts: string[] = [];
  for (const value of Object.values(obj)) {
    if (typeof value === "string") parts.push(value);
    else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") parts.push(item);
      }
    }
  }
  return parts.join(" ") || `Request failed (${status})`;
}

/** Authenticated staff API call (JWT preferred; CMS role headers as fallback for CMS-only). */
export async function staffFetch<T>(
  path: string,
  options: StaffFetchOptions = {},
): Promise<T> {
  const url = new URL(`${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  async function once(token: string | null) {
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.roleId) headers["X-Mistnleaf-Role-Id"] = options.roleId;
    if (options.userId) headers["X-Mistnleaf-User-Id"] = options.userId;

    return fetch(url.toString(), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  }

  let token = getAccessToken();
  if (!token && !getRefreshToken()) {
    throw new Error("Not signed in to the API. Sign out and sign in again.");
  }

  let response = await once(token);
  if (response.status === 401 && getRefreshToken()) {
    token = await refreshAccessToken();
    response = await once(token);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(formatApiError(body, response.status));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type StaffEnquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  channel: "Website" | "Phone" | "Email";
  status: "New" | "In progress" | "Closed";
  receivedAt: string;
  staff_notes?: string;
};

export type StaffReservation = {
  id: string;
  guest: string;
  email: string;
  phone: string;
  room: string;
  roomType: string;
  adults: number;
  children: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  status: string;
  source: string;
  paymentStatus: string;
  amount: number | string;
  paidAmount: number | string;
  notes?: string;
};

export async function fetchStaffEnquiries(params?: {
  status?: string;
  search?: string;
}): Promise<StaffEnquiry[]> {
  const payload = await staffFetch<Paginated<StaffEnquiry> | StaffEnquiry[]>(
    "/api/staff/enquiries/",
    { searchParams: { page_size: "100", status: params?.status, search: params?.search } },
  );
  return Array.isArray(payload) ? payload : payload.results;
}

export async function updateStaffEnquiry(
  id: string,
  patch: { status?: string; staff_notes?: string },
): Promise<StaffEnquiry> {
  return staffFetch<StaffEnquiry>(`/api/staff/enquiries/${id}/`, {
    method: "PATCH",
    body: patch,
  });
}

export async function fetchStaffBookings(params?: {
  status?: string;
  search?: string;
  source?: string;
}): Promise<StaffReservation[]> {
  const payload = await staffFetch<Paginated<StaffReservation> | StaffReservation[]>(
    "/api/staff/bookings/",
    {
      searchParams: {
        page_size: "100",
        status: params?.status,
        search: params?.search,
        source: params?.source,
      },
    },
  );
  return Array.isArray(payload) ? payload : payload.results;
}

export async function updateStaffBooking(
  id: string,
  patch: {
    status?: string;
    payment_status?: string;
    paid_amount?: number;
    notes?: string;
    room_unit?: string;
    guest?: string;
    email?: string;
    phone?: string;
  },
): Promise<StaffReservation> {
  return staffFetch<StaffReservation>(`/api/staff/bookings/${id}/`, {
    method: "PATCH",
    body: patch,
  });
}

export async function createStaffBooking(body: {
  guest: string;
  email: string;
  phone: string;
  room?: string;
  roomType?: string;
  room_unit?: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
  source?: string;
  notes?: string;
  status?: string;
  paymentStatus?: string;
  paidAmount?: number;
}): Promise<StaffReservation> {
  return staffFetch<StaffReservation>("/api/staff/bookings/", {
    method: "POST",
    body,
  });
}

function unwrapList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.results ?? [];
}

export type StaffRoom = {
  id: string;
  code: string;
  number: string;
  name: string;
  display_name: string;
  room_type_id: string;
  room_type_name: string;
  room_type_slug: string;
  type: string;
  floor: string;
  capacity: number;
  beds: string;
  rate: number | string;
  sizeSqFt: number | null;
  amenities: string[];
  imageUrl?: string;
  status: string;
  dashboardStatus: string;
  housekeeping_status: string;
  assignee?: string;
  notes?: string;
  guest?: string;
  reservationId?: string | null;
  is_active: boolean;
};

export type StaffRoomType = {
  id: string;
  name: string;
  slug: string;
  beds: string;
  base_rate: number | string;
  size_sq_ft: number | null;
  amenities: string[];
  image: string;
  unit_count?: number;
};

export async function fetchStaffRooms(): Promise<StaffRoom[]> {
  const payload = await staffFetch<Paginated<StaffRoom> | StaffRoom[]>(
    "/api/staff/rooms/",
    { searchParams: { page_size: "200" } },
  );
  return unwrapList(payload);
}

export async function fetchStaffRoomTypes(): Promise<StaffRoomType[]> {
  const payload = await staffFetch<Paginated<StaffRoomType> | StaffRoomType[]>(
    "/api/staff/room-types/",
    { searchParams: { page_size: "200" } },
  );
  return unwrapList(payload);
}

export async function createStaffRoomType(body: {
  name: string;
  slug?: string;
  short_description?: string;
  max_guests?: number;
  beds?: string;
  base_rate?: number;
  size_sq_ft?: number;
  size_label?: string;
  amenities?: string[];
}): Promise<StaffRoomType> {
  return staffFetch<StaffRoomType>("/api/staff/room-types/", {
    method: "POST",
    body,
  });
}

export async function updateStaffRoomType(
  slug: string,
  body: Partial<{
    name: string;
    max_guests: number;
    beds: string;
    base_rate: number;
    size_sq_ft: number;
    size_label: string;
    amenities: string[];
  }>,
): Promise<StaffRoomType> {
  return staffFetch<StaffRoomType>(`/api/staff/room-types/${slug}/`, {
    method: "PATCH",
    body,
  });
}

export async function updateStaffRoomStatus(
  id: string,
  patch: {
    status?: string;
    housekeeping_status?: string;
    assignee?: string;
    notes?: string;
    dashboardStatus?: string;
  },
): Promise<StaffRoom> {
  return staffFetch<StaffRoom>(`/api/staff/rooms/${id}/status/`, {
    method: "PATCH",
    body: patch,
  });
}

export async function createStaffRoom(body: {
  room_type_id: string;
  code: string;
  name?: string;
  floor?: string;
  capacity?: number;
  status?: string;
  housekeeping_status?: string;
  assignee?: string;
  notes?: string;
}): Promise<StaffRoom> {
  return staffFetch<StaffRoom>("/api/staff/rooms/", {
    method: "POST",
    body,
  });
}

export async function updateStaffRoom(
  id: string,
  body: Partial<{
    room_type_id: string;
    code: string;
    name: string;
    floor: string;
    capacity: number;
    status: string;
    housekeeping_status: string;
    assignee: string;
    notes: string;
    is_active: boolean;
  }>,
): Promise<StaffRoom> {
  return staffFetch<StaffRoom>(`/api/staff/rooms/${id}/`, {
    method: "PATCH",
    body,
  });
}

export type StaffMaintenanceTicket = {
  id: string;
  room: string;
  roomUnitId?: string | null;
  issue: string;
  category?: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In progress" | "Resolved";
  reportedBy: string;
  reportedAt: string;
};

export async function fetchStaffMaintenance(): Promise<StaffMaintenanceTicket[]> {
  const payload = await staffFetch<Paginated<StaffMaintenanceTicket> | StaffMaintenanceTicket[]>(
    "/api/staff/maintenance/",
  );
  return unwrapList(payload);
}

export async function createStaffMaintenance(body: {
  room: string;
  roomUnitId?: string;
  issue: string;
  category?: string;
  priority?: string;
  reportedBy?: string;
}): Promise<StaffMaintenanceTicket> {
  return staffFetch<StaffMaintenanceTicket>("/api/staff/maintenance/", {
    method: "POST",
    body,
  });
}

export async function updateStaffMaintenance(
  id: string,
  patch: { status?: string; priority?: string; issue?: string },
): Promise<StaffMaintenanceTicket> {
  return staffFetch<StaffMaintenanceTicket>(`/api/staff/maintenance/${id}/`, {
    method: "PATCH",
    body: patch,
  });
}

export type StaffDirectoryUser = BackendUser & {
  phone?: string;
  is_active: boolean;
  last_login?: string | null;
  created_at?: string;
  first_name?: string;
  last_name?: string;
};

export async function fetchStaffUsers(role?: string): Promise<StaffDirectoryUser[]> {
  const payload = await staffFetch<Paginated<StaffDirectoryUser> | StaffDirectoryUser[]>(
    "/api/staff/users/",
    { searchParams: { role } },
  );
  return unwrapList(payload);
}

export async function createStaffDirectoryUser(body: {
  name: string;
  email: string;
  password: string;
  role_id: RoleId;
  phone?: string;
  department?: string;
}): Promise<StaffDirectoryUser> {
  return staffFetch<StaffDirectoryUser>("/api/staff/users/", {
    method: "POST",
    body,
  });
}

export async function updateStaffDirectoryUser(
  id: string,
  body: Record<string, unknown>,
): Promise<StaffDirectoryUser> {
  return staffFetch<StaffDirectoryUser>(`/api/staff/users/${id}/`, {
    method: "PATCH",
    body,
  });
}

export async function deleteStaffDirectoryUser(id: string): Promise<void> {
  await staffFetch<void>(`/api/staff/users/${id}/`, { method: "DELETE" });
}

export type StaffRolePayload = {
  id: RoleId;
  name: string;
  description: string;
  locked: boolean;
  permissions: string[];
  base_permissions: string[];
  system_level_permissions: string[];
};

export async function fetchStaffRoles(): Promise<StaffRolePayload[]> {
  const payload = await staffFetch<StaffRolePayload[] | Paginated<StaffRolePayload>>(
    "/api/staff/roles/",
  );
  return unwrapList(payload);
}

export async function fetchStaffRole(roleId: RoleId): Promise<StaffRolePayload> {
  return staffFetch<StaffRolePayload>(`/api/staff/roles/${roleId}/`);
}

export async function updateStaffRolePermissions(
  roleId: RoleId,
  permissions: string[],
): Promise<StaffRolePayload> {
  return staffFetch<StaffRolePayload>(`/api/staff/roles/${roleId}/`, {
    method: "PATCH",
    body: { permissions },
  });
}

export type StaffPropertySettings = {
  name: string;
  timezone: string;
  currency: string;
  checkInTime: string;
  checkOutTime: string;
  taxPercent: string;
};

export async function fetchStaffSettings(): Promise<StaffPropertySettings> {
  return staffFetch<StaffPropertySettings>("/api/staff/settings/");
}

export async function saveStaffSettings(
  payload: Partial<StaffPropertySettings>,
): Promise<StaffPropertySettings> {
  return staffFetch<StaffPropertySettings>("/api/staff/settings/", {
    method: "PUT",
    body: payload,
  });
}

export async function fetchCurrentBackendUser(): Promise<BackendUser | null> {
  try {
    return await staffFetch<BackendUser>("/api/auth/me/");
  } catch {
    return null;
  }
}
