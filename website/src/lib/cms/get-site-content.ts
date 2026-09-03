import { fetchPublishedCms } from "@/lib/cms/fetch";
import {
  getDefaultSiteContent,
  mapCmsToSiteContent,
  type MappedSiteContent,
} from "@/lib/cms/map-to-site";
import type { Room } from "@/lib/site";

export async function getSiteContent(): Promise<MappedSiteContent> {
  const cms = await fetchPublishedCms();
  if (!cms) return getDefaultSiteContent();
  return mapCmsToSiteContent(cms);
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const content = await getSiteContent();
  return content.allRooms.find((room) => room.slug === slug) ?? null;
}
