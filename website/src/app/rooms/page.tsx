import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { CtaBand, PageIntro, Section } from "@/components/PageShell";
import { formatInr, rooms } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rooms & Accommodation",
  description: "Explore suites, cottages, and lodge rooms at Mistnleaf.",
};

export default function RoomsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Stay"
        title="Rooms & Accommodation"
        lead="Three carefully composed spaces — each with forest light, soft linens, and room to slow down."
      />
      <Section className="pt-0">
        <div className="rooms-index">
          {rooms.map((room, index) => (
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
                />
              </Link>
              <div className="rooms-index__body">
                <h2 className="rooms-index__name">{room.name}</h2>
                <p className="rooms-index__short">{room.short}</p>
                <dl className="rooms-index__facts">
                  <div>
                    <dt>Occupancy</dt>
                    <dd>Up to {room.guests}</dd>
                  </div>
                  <div>
                    <dt>Beds</dt>
                    <dd>{room.beds}</dd>
                  </div>
                  <div>
                    <dt>Size</dt>
                    <dd>{room.size}</dd>
                  </div>
                  <div>
                    <dt>From</dt>
                    <dd>{formatInr(room.price)} / night</dd>
                  </div>
                </dl>
                <p className="rooms-index__avail">{room.availability}</p>
                <div className="rooms-index__actions">
                  <ButtonLink href={`/booking/search?room=${room.slug}`}>
                    Book Now
                  </ButtonLink>
                  <Link href={`/rooms/${room.slug}`} className="link-arrow">
                    View full details
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
