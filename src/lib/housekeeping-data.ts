export type HousekeepingStaffMember = {
  id: string;
  name: string;
  email: string;
  status: "On duty" | "Off duty";
};

/** Housekeeping staff available for task assignment. */
export const housekeepingStaff: HousekeepingStaffMember[] = [
  {
    id: "HK-ST-01",
    name: "Sofia Fernandes",
    email: "sofia@mistnleaf.com",
    status: "On duty",
  },
  {
    id: "HK-ST-02",
    name: "Ravi Kumar",
    email: "ravi@mistnleaf.com",
    status: "On duty",
  },
  {
    id: "HK-ST-03",
    name: "Anita D'Souza",
    email: "anita@mistnleaf.com",
    status: "On duty",
  },
  {
    id: "HK-ST-04",
    name: "Priya Nair",
    email: "priya.hk@mistnleaf.com",
    status: "Off duty",
  },
];

export function createHousekeepingStaffId(list: HousekeepingStaffMember[]) {
  const max = list.reduce((highest, member) => {
    const match = member.id.match(/^HK-ST-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `HK-ST-${String(max + 1).padStart(2, "0")}`;
}

export function emptyHousekeepingStaffMember(
  list: HousekeepingStaffMember[] = housekeepingStaff,
): HousekeepingStaffMember {
  return {
    id: createHousekeepingStaffId(list),
    name: "",
    email: "",
    status: "On duty",
  };
}

export type HousekeepingRoomStatus =
  | "Dirty"
  | "Cleaning Required"
  | "Cleaning in Progress"
  | "Clean"
  | "Inspected"
  | "Ready";

export type AssignedRoom = {
  id: string;
  roomNumber: string;
  roomType: string;
  status: HousekeepingRoomStatus;
  priority: "High" | "Medium" | "Low";
  taskType: "Checkout clean" | "Stayover" | "Deep clean" | "Turndown";
  checkoutTime?: string;
  checkinTime?: string;
  assignee: string;
  notes?: string;
};

export type MaintenanceIssueCategory =
  | "Plumbing"
  | "Electrical"
  | "AC / HVAC"
  | "Furniture"
  | "Other";

export const housekeepingSummary = {
  toClean: 5,
  inProgress: 2,
  awaitingInspection: 1,
  ready: 17,
};

export const maintenanceCategories: MaintenanceIssueCategory[] = [
  "Plumbing",
  "Electrical",
  "AC / HVAC",
  "Furniture",
  "Other",
];

/** Seed assigned rooms — filtered per staff member in the provider. */
export const assignedRoomsSeed: AssignedRoom[] = [
  {
    id: "AR-01",
    roomNumber: "Leaf Suite 03",
    roomType: "Leaf Suite",
    status: "Cleaning in Progress",
    priority: "High",
    taskType: "Checkout clean",
    checkoutTime: "11:00 AM",
    checkinTime: "3:00 PM",
    assignee: "Sofia Fernandes",
  },
  {
    id: "AR-02",
    roomNumber: "Mist Twin 09",
    roomType: "Mist Twin",
    status: "Cleaning Required",
    priority: "High",
    taskType: "Checkout clean",
    checkoutTime: "10:30 AM",
    checkinTime: "2:00 PM",
    assignee: "Sofia Fernandes",
  },
  {
    id: "AR-03",
    roomNumber: "Garden Deluxe 08",
    roomType: "Garden Deluxe",
    status: "Cleaning Required",
    priority: "Medium",
    taskType: "Turndown",
    checkinTime: "6:00 PM",
    assignee: "Sofia Fernandes",
  },
  {
    id: "AR-04",
    roomNumber: "Canopy King 15",
    roomType: "Canopy King",
    status: "Inspected",
    priority: "Medium",
    taskType: "Stayover",
    assignee: "Sofia Fernandes",
  },
  {
    id: "AR-05",
    roomNumber: "Mist Twin 16",
    roomType: "Mist Twin",
    status: "Cleaning Required",
    priority: "Medium",
    taskType: "Stayover",
    assignee: "Ravi Kumar",
  },
  {
    id: "AR-06",
    roomNumber: "Canopy King 22",
    roomType: "Canopy King",
    status: "Cleaning Required",
    priority: "Low",
    taskType: "Deep clean",
    checkoutTime: "9:00 AM",
    assignee: "Ravi Kumar",
  },
  {
    id: "AR-07",
    roomNumber: "Leaf Suite 01",
    roomType: "Leaf Suite",
    status: "Cleaning in Progress",
    priority: "High",
    taskType: "Checkout clean",
    checkoutTime: "11:30 AM",
    checkinTime: "4:00 PM",
    assignee: "Ravi Kumar",
  },
  {
    id: "AR-08",
    roomNumber: "Garden Deluxe 12",
    roomType: "Garden Deluxe",
    status: "Ready",
    priority: "Low",
    taskType: "Stayover",
    assignee: "Anita D'Souza",
  },
  {
    id: "AR-09",
    roomNumber: "Mist Twin 04",
    roomType: "Mist Twin",
    status: "Ready",
    priority: "Low",
    taskType: "Checkout clean",
    assignee: "Sofia Fernandes",
  },
  {
    id: "AR-10",
    roomNumber: "Canopy King 18",
    roomType: "Canopy King",
    status: "Ready",
    priority: "Medium",
    taskType: "Stayover",
    assignee: "Sofia Fernandes",
  },
];

export type StaffMaintenanceReport = {
  id: string;
  room: string;
  category: MaintenanceIssueCategory;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: "Submitted" | "Acknowledged";
};

export const staffMaintenanceReportsSeed: StaffMaintenanceReport[] = [
  {
    id: "SMR-01",
    room: "Canopy King 10",
    category: "AC / HVAC",
    description: "Room not cooling — guest reported warm air from vents.",
    reportedBy: "Sofia Fernandes",
    reportedAt: "2026-08-20 08:15",
    status: "Acknowledged",
  },
];

export const statusLabels: Record<HousekeepingRoomStatus, string> = {
  Dirty: "Dirty",
  "Cleaning Required": "Cleaning required",
  "Cleaning in Progress": "Cleaning in progress",
  Clean: "Clean",
  Inspected: "Inspected",
  Ready: "Ready",
};

export function getActionForStatus(
  status: HousekeepingRoomStatus,
): "Start Cleaning" | "Mark Clean" | "Send for Inspection" | "Mark Ready" | "View" {
  switch (status) {
    case "Dirty":
    case "Cleaning Required":
      return "Start Cleaning";
    case "Cleaning in Progress":
      return "Mark Clean";
    case "Clean":
      return "Send for Inspection";
    case "Inspected":
      return "Mark Ready";
    case "Ready":
      return "View";
  }
}

export function nextStatus(
  status: HousekeepingRoomStatus,
  action: string,
): HousekeepingRoomStatus {
  if (action === "Start Cleaning") {
    if (status === "Dirty") return "Cleaning Required";
    return "Cleaning in Progress";
  }
  if (action === "Mark Clean" || action === "Continue") {
    return "Clean";
  }
  if (action === "Send for Inspection" || action === "Mark as Clean") {
    return "Inspected";
  }
  if (action === "Mark Ready") {
    return "Ready";
  }
  return status;
}

export function countByStatus(rooms: AssignedRoom[]) {
  return {
    dirty: rooms.filter((r) => r.status === "Dirty").length,
    toClean: rooms.filter(
      (r) => r.status === "Cleaning Required" || r.status === "Dirty",
    ).length,
    inProgress: rooms.filter((r) => r.status === "Cleaning in Progress").length,
    clean: rooms.filter((r) => r.status === "Clean").length,
    awaitingInspection: rooms.filter((r) => r.status === "Inspected").length,
    ready: rooms.filter((r) => r.status === "Ready").length,
  };
}

export const HK_STORAGE_KEY = "mistnleaf_hk_rooms_v1";
export const HK_REPORTS_KEY = "mistnleaf_hk_reports_v1";
