import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://mistnleaf.example";
  const routes = [
    "",
    "/about",
    "/rooms",
    "/experiences",
    "/amenities",
    "/gallery",
    "/offers",
    "/dining",
    "/things-to-do",
    "/location",
    "/contact",
    "/faqs",
    "/booking/search",
    "/privacy",
    "/terms",
    "/cancellation",
  ];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
