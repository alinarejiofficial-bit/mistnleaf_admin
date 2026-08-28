import { DashboardRouter } from "@/components/dashboard/DashboardRouter";
import { PublicWebsite } from "@/components/site/PublicWebsite";

const isPublicSite = process.env.NEXT_PUBLIC_PUBLIC_SITE === "true";

export default function DashboardPage() {
  if (isPublicSite) return <PublicWebsite />;
  return <DashboardRouter />;
}
