import type { RoleId } from "@/lib/roles";

export type OperationalNotificationType = "Arrival" | "Payment" | "Housekeeping" | "System";

export type ContentNotificationGroup =
  | "Content Update"
  | "New Content Request"
  | "Content Approval"
  | "Publishing"
  | "Media / Asset"
  | "Offers & Testimonials"
  | "System / Permissions";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  time: string;
  roles: RoleId[];
} & (
  | { channel: "operational"; type: OperationalNotificationType }
  | { channel: "content"; group: ContentNotificationGroup }
);

const cmsRoles: RoleId[] = [
  "website_content_manager",
  "super_administrator",
  "resort_manager",
];

const operationalRoles: RoleId[] = [
  "super_administrator",
  "resort_manager",
  "front_desk",
  "housekeeping",
  "accountant",
];

export const contentManagerNotificationGroups: ContentNotificationGroup[] = [
  "Content Update",
  "New Content Request",
  "Content Approval",
  "Publishing",
  "Media / Asset",
  "Offers & Testimonials",
  "System / Permissions",
];

const operationalNotifications: AppNotification[] = [
  {
    id: "NTF-01",
    title: "7 arrivals today",
    message: "Front desk checklist is ready for today's check-ins.",
    channel: "operational",
    type: "Arrival",
    read: false,
    time: "10 min ago",
    roles: operationalRoles,
  },
  {
    id: "NTF-02",
    title: "Payment pending",
    message: "RSV-2042 still awaiting card authorization.",
    channel: "operational",
    type: "Payment",
    read: false,
    time: "35 min ago",
    roles: operationalRoles,
  },
  {
    id: "NTF-03",
    title: "Housekeeping backlog",
    message: "4 rooms still require cleaning before 3 PM.",
    channel: "operational",
    type: "Housekeeping",
    read: true,
    time: "1 hour ago",
    roles: ["super_administrator", "resort_manager", "housekeeping"],
  },
  {
    id: "NTF-04",
    title: "System backup complete",
    message: "Nightly property backup finished successfully.",
    channel: "operational",
    type: "System",
    read: true,
    time: "6 hours ago",
    roles: operationalRoles,
  },
];

const contentNotifications: AppNotification[] = [
  {
    id: "CMS-NTF-01",
    title: "Homepage content updated",
    message: "Hero headline and intro copy were saved on the public homepage.",
    channel: "content",
    group: "Content Update",
    read: false,
    time: "12 min ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-02",
    title: "About/intro content updated",
    message: "The standalone About page copy and image were updated.",
    channel: "content",
    group: "Content Update",
    read: false,
    time: "28 min ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-03",
    title: "Room information updated",
    message: "Forest View Suite description and gallery images were revised.",
    channel: "content",
    group: "Content Update",
    read: true,
    time: "1 hour ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-04",
    title: "FAQ/contact information updated",
    message: "Guest FAQs and footer contact details were published.",
    channel: "content",
    group: "Content Update",
    read: true,
    time: "2 hours ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-05",
    title: "Management requests new website content",
    message: "Resort Manager asked for a monsoon-season landing section on the homepage.",
    channel: "content",
    group: "New Content Request",
    read: false,
    time: "3 hours ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-06",
    title: "New offer needs to be published",
    message: "“Leaf & Table” package is saved as draft and ready for review.",
    channel: "content",
    group: "New Content Request",
    read: false,
    time: "4 hours ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-07",
    title: "Content approved for publishing",
    message: "Super Administrator approved the updated Offers & Packages section.",
    channel: "content",
    group: "Content Approval",
    read: true,
    time: "Yesterday",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-08",
    title: "Changes requested",
    message: "Gallery captions need shorter copy before publishing.",
    channel: "content",
    group: "Content Approval",
    read: false,
    time: "Yesterday",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-09",
    title: "Content successfully published",
    message: "Footer links and brand description are now live on the public site.",
    channel: "content",
    group: "Publishing",
    read: true,
    time: "Yesterday",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-10",
    title: "Content scheduled for publishing",
    message: "Weekend offer package is scheduled to go live Saturday at 9:00 AM.",
    channel: "content",
    group: "Publishing",
    read: false,
    time: "2 days ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-11",
    title: "Content unpublished",
    message: "An outdated experience block was removed from the homepage.",
    channel: "content",
    group: "Publishing",
    read: true,
    time: "2 days ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-12",
    title: "New gallery upload",
    message: "6 new mist-and-forest images were added to the Gallery.",
    channel: "content",
    group: "Media / Asset",
    read: false,
    time: "3 days ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-13",
    title: "Image upload completed",
    message: "Room hero image for Canopy Retreat finished processing.",
    channel: "content",
    group: "Media / Asset",
    read: true,
    time: "3 days ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-14",
    title: "Asset replaced",
    message: "Homepage hero banner was replaced with the new brand photography.",
    channel: "content",
    group: "Media / Asset",
    read: true,
    time: "4 days ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-15",
    title: "New offer updated for website",
    message: "“Two Nights in the Mist” pricing and terms were revised.",
    channel: "content",
    group: "Offers & Testimonials",
    read: false,
    time: "4 days ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-16",
    title: "Testimonial submitted for review",
    message: "A new guest review from Ananya Sharma is waiting in drafts.",
    channel: "content",
    group: "Offers & Testimonials",
    read: false,
    time: "5 days ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-17",
    title: "Testimonial approved",
    message: "James Carter’s testimonial is approved and published on the homepage.",
    channel: "content",
    group: "Offers & Testimonials",
    read: true,
    time: "5 days ago",
    roles: cmsRoles,
  },
  {
    id: "CMS-NTF-18",
    title: "Website CMS permission changed",
    message: "Gallery publish access was updated for your Content Manager account.",
    channel: "content",
    group: "System / Permissions",
    read: false,
    time: "1 week ago",
    roles: ["website_content_manager", "super_administrator"],
  },
  {
    id: "CMS-NTF-19",
    title: "Content Manager permissions updated",
    message: "Your role now includes offers management on the public website.",
    channel: "content",
    group: "System / Permissions",
    read: true,
    time: "1 week ago",
    roles: ["website_content_manager", "super_administrator"],
  },
];

export const allNotifications: AppNotification[] = [
  ...operationalNotifications,
  ...contentNotifications,
];

export function getNotificationsForRole(roleId: RoleId | undefined): AppNotification[] {
  if (!roleId) return [];
  return allNotifications.filter((item) => item.roles.includes(roleId));
}

export function isContentManagerRole(roleId: RoleId | undefined) {
  return roleId === "website_content_manager";
}

export function getNotificationBadgeLabel(notification: AppNotification) {
  return notification.channel === "content" ? notification.group : notification.type;
}

export function getNotificationsPageDescription(roleId: RoleId | undefined) {
  if (isContentManagerRole(roleId)) {
    return "Content updates, publishing, media, offers, testimonials, approvals, and CMS permission alerts.";
  }
  return "Alerts for arrivals, payments, housekeeping, and system events.";
}

/** @deprecated Use allNotifications from @/lib/notifications */
export const notifications = allNotifications;
