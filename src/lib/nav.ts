import {
  BedDouble,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Home,
  Image,
  Info,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageSquareQuote,
  Percent,
  Phone,
  Settings,
  Share2,
  Sparkles,
  Users,
  UserCircle,
  Wrench,
  Bell,
  BadgePercent,
  Package,
  BarChart3,
  ScrollText,
  ListChecks,
  RotateCcw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { RoleId } from "@/lib/roles";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Reservations", href: "/reservations", icon: ClipboardCheck },
      { label: "Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    items: [
      { label: "Rooms", href: "/rooms", icon: BedDouble },
      { label: "Guests", href: "/guests", icon: Users },
    ],
  },
  {
    items: [
      { label: "Check-in", href: "/check-in", icon: LogIn },
      { label: "Check-out", href: "/check-out", icon: LogOut },
    ],
  },
  {
    items: [
      { label: "Housekeeping", href: "/housekeeping", icon: Sparkles },
      { label: "Maintenance", href: "/maintenance", icon: Wrench },
    ],
  },
  {
    items: [
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Invoices", href: "/invoices", icon: FileText },
    ],
  },
  {
    items: [
      { label: "Offers", href: "/offers", icon: BadgePercent },
      { label: "Add-ons", href: "/add-ons", icon: Package },
    ],
  },
  {
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Enquiries", href: "/enquiries", icon: Mail },
    ],
  },
  {
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Website CMS", href: "/website", icon: Globe },
    ],
  },
  {
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Roles & Permissions", href: "/roles", icon: ShieldCheck },
      { label: "Audit logs", href: "/audit-logs", icon: ScrollText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/** Front Desk sidebar — bookings, guests, check-in/out, payments and invoices only. */
export const frontDeskNavSections: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Reservations",
    items: [
      { label: "Bookings", href: "/reservations", icon: ClipboardCheck },
      { label: "Booking Calendar", href: "/calendar", icon: CalendarDays },
      { label: "Enquiries", href: "/enquiries", icon: Mail },
    ],
  },
  {
    items: [{ label: "Guests", href: "/guests", icon: Users }],
  },
  {
    items: [
      { label: "Check-in", href: "/check-in", icon: LogIn },
      { label: "Check-out", href: "/check-out", icon: LogOut },
    ],
  },
  {
    items: [
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Invoices", href: "/invoices", icon: FileText },
    ],
  },
  {
    items: [{ label: "Notifications", href: "/notifications", icon: Bell }],
  },
  {
    items: [{ label: "Profile", href: "/profile", icon: UserCircle }],
  },
];

/** Housekeeping Staff sidebar — cleaning operations only. */
export const housekeepingNavSections: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    items: [
      { label: "My Rooms", href: "/my-rooms", icon: BedDouble },
      { label: "Cleaning Tasks", href: "/cleaning-tasks", icon: ListChecks },
      { label: "Room Status", href: "/room-status", icon: ClipboardCheck },
    ],
  },
  {
    items: [
      { label: "Maintenance Issues", href: "/maintenance-issues", icon: Wrench },
    ],
  },
  {
    items: [{ label: "Notifications", href: "/notifications", icon: Bell }],
  },
  {
    items: [{ label: "Profile", href: "/profile", icon: UserCircle }],
  },
];

/** Accountant / Finance sidebar — payments, invoices, refunds, and reports only. */
export const accountantNavSections: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Finance",
    items: [
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Invoices", href: "/invoices", icon: FileText },
      { label: "Refunds", href: "/refunds", icon: RotateCcw },
    ],
  },
  {
    items: [{ label: "Financial Reports", href: "/financial-reports", icon: BarChart3 }],
  },
  {
    items: [{ label: "Notifications", href: "/notifications", icon: Bell }],
  },
  {
    items: [{ label: "Profile", href: "/profile", icon: UserCircle }],
  },
];

/** Website Content Manager sidebar — CMS sections only. */
export const websiteContentManagerNavSections: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Website CMS",
    items: [
      { label: "Homepage", href: "/website/homepage", icon: Home },
      { label: "About", href: "/website/about", icon: Info },
      { label: "Rooms", href: "/website/rooms", icon: LayoutGrid },
      { label: "Amenities", href: "/website/amenities", icon: Sparkles },
      { label: "Experiences", href: "/website/experiences", icon: Sparkles },
      { label: "Gallery", href: "/website/gallery", icon: Image },
      { label: "Offers", href: "/website/offers", icon: Percent },
      { label: "Testimonials", href: "/website/testimonials", icon: MessageSquareQuote },
      { label: "FAQs", href: "/website/faqs", icon: HelpCircle },
      { label: "Contact", href: "/website/contact", icon: Phone },
      { label: "Location", href: "/website/location", icon: MapPin },
      { label: "Social", href: "/website/social", icon: Share2 },
      { label: "Footer", href: "/website/footer", icon: FileText },
    ],
  },
  {
    items: [{ label: "Notifications", href: "/notifications", icon: Bell }],
  },
  {
    items: [{ label: "Profile", href: "/profile", icon: UserCircle }],
  },
];

export function getNavSectionsForRole(roleId: RoleId): NavSection[] {
  if (roleId === "front_desk") return frontDeskNavSections;
  if (roleId === "housekeeping") return housekeepingNavSections;
  if (roleId === "accountant") return accountantNavSections;
  if (roleId === "website_content_manager") return websiteContentManagerNavSections;
  return navSections;
}

export const helpNav = {
  label: "Help",
  href: "/help",
  icon: HelpCircle,
};

export const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/reservations": "Reservations",
  "/calendar": "Calendar",
  "/rooms": "Rooms",
  "/guests": "Guests",
  "/check-in": "Check-in",
  "/check-out": "Check-out",
  "/housekeeping": "Housekeeping",
  "/maintenance": "Maintenance",
  "/payments": "Payments",
  "/invoices": "Invoices",
  "/offers": "Offers",
  "/add-ons": "Add-ons",
  "/reports": "Reports",
  "/enquiries": "Enquiries",
  "/notifications": "Notifications",
  "/website": "Website CMS",
  "/website/homepage": "Homepage",
  "/website/about": "About",
  "/website/rooms": "Rooms",
  "/website/amenities": "Amenities",
  "/website/experiences": "Experiences",
  "/website/gallery": "Gallery",
  "/website/offers": "Offers & Packages",
  "/website/testimonials": "Testimonials",
  "/website/faqs": "FAQs",
  "/website/contact": "Contact information",
  "/website/location": "Location",
  "/website/social": "Social media",
  "/website/footer": "Footer",
  "/users": "Users",
  "/roles": "Roles & Permissions",
  "/audit-logs": "Audit logs",
  "/settings": "Settings",
  "/help": "Help",
  "/profile": "Profile",
  "/my-rooms": "My Rooms",
  "/cleaning-tasks": "Cleaning Tasks",
  "/room-status": "Room Status",
  "/maintenance-issues": "Maintenance Issues",
  "/refunds": "Refunds",
  "/financial-reports": "Financial Reports",
};
