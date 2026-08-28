import { notFound } from "next/navigation";
import { WebsiteCmsSectionPage } from "@/components/cms/WebsiteCmsSectionPage";
import { cmsRouteLabels, isCmsRouteSection } from "@/lib/cms-data";

type Props = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  if (!isCmsRouteSection(section)) {
    return { title: "Website CMS" };
  }
  return { title: cmsRouteLabels[section] };
}

export default async function WebsiteSectionPage({ params }: Props) {
  const { section } = await params;
  if (!isCmsRouteSection(section)) notFound();
  return <WebsiteCmsSectionPage section={section} />;
}
