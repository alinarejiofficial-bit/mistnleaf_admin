import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, Section } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Explore Mistnleaf",
  description: "Everything you can do on the Mistnleaf public website.",
};

const features = [
  {
    title: "View the resort",
    href: "/about",
    detail: "Learn the story and atmosphere of Mistnleaf Staycation.",
  },
  {
    title: "Explore rooms",
    href: "/rooms",
    detail: "Browse accommodation options and capacity.",
  },
  {
    title: "Room details",
    href: "/rooms",
    detail: "Open any room for photos, amenities, and booking.",
  },
  {
    title: "Photographs & galleries",
    href: "/gallery",
    detail: "Editorial gallery of resort, rooms, and nature.",
  },
  {
    title: "Facilities & amenities",
    href: "/amenities",
    detail: "See shared comforts and on-property facilities.",
  },
  {
    title: "Experiences & activities",
    href: "/experiences",
    detail: "Nature experiences, plus nearby things to do.",
  },
  {
    title: "Check availability",
    href: "/booking/search",
    detail: "Search dates and guest counts for open rooms.",
  },
  {
    title: "Make a reservation",
    href: "/booking/search",
    detail: "Select a room, share guest details, and reserve.",
  },
  {
    title: "Make a payment",
    href: "/booking/search",
    detail: "Complete checkout and receive confirmation.",
  },
  {
    title: "Contact the resort",
    href: "/contact",
    detail: "Call, email, or message the front desk.",
  },
  {
    title: "Location & directions",
    href: "/location",
    detail: "Find the resort and open map directions.",
  },
  {
    title: "Submit enquiries",
    href: "/contact",
    detail: "Send a validated enquiry for stays or questions.",
  },
];

export default function ExplorePage() {
  return (
    <>
      <PageIntro
        eyebrow="Public website"
        title="Explore Mistnleaf"
        lead="A guided map of everything guests can do on the customer-facing site."
      />
      <Section className="pt-0">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group border-t border-line pt-5 transition hover:border-pine"
            >
              <h2 className="font-display text-2xl text-pine group-hover:text-pine-soft">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.detail}
              </p>
              <span className="link-arrow mt-4">Open</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
