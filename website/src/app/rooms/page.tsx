import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { CmsSectionEdit } from "@/components/cms/CmsSectionEdit";
import { CtaBand, PageIntro, Section } from "@/components/PageShell";
import { getSiteContent } from "@/lib/cms/get-site-content";
import { formatInr } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rooms & Accommodation",
  description: "Explore suites, cottages, and lodge rooms at Mistnleaf.",
};

export default async function RoomsPage() {
  const content = await getSiteContent();
  const band = content.homepageBands.rooms;

  return (
    <>
      <PageIntro
        eyebrow={band.eyebrow}
        title={band.title}
        lead={band.lead}
      />
      <Section className="relative pt-0">
        <Suspense fallback={null}>
          <CmsSectionEdit section="rooms" label="Rooms" />
        </Suspense>
        <div className="rooms-index">
          {content.allRooms.map((room, index) => (
            <article
              key={room.slug}
              className={`rooms-index__card ${
                index % 2 === 1 ? "rooms-index__card--flip" : ""
              }`}
            >
              <Link
                href={`/rooms/${room.slug}`}
                className="rooms-index__media"
              >
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover transition duration-700 hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={room.image.startsWith("http")}
                />
              </Link>
              <div className="rooms-index__body">
                <p className="rooms-index__index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="rooms-index__title">
                  <Link href={`/rooms/${room.slug}`}>{room.name}</Link>
                </h2>
                <p className="rooms-index__lead">{room.short}</p>
                <p className="rooms-index__price">
                  From {formatInr(room.price)} / night
                </p>
                <div className="rooms-index__actions">
                  <ButtonLink href={`/rooms/${room.slug}`} variant="ghost">
                    View details
                  </ButtonLink>
                  <Link
                    href={`/booking/search?room=${room.slug}`}
                    className="link-arrow"
                  >
                    Book now
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
