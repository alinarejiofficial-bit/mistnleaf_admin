import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { PageIntro, Section } from "@/components/PageShell";
import { formatInr, getRoom, rooms, stayInfo } from "@/lib/site";

type Props = PageProps<"/rooms/[slug]">;

export function generateStaticParams() {
  return rooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) return { title: "Room" };
  return {
    title: room.name,
    description: room.short,
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) notFound();

  const gallery = room.gallery.length > 0 ? room.gallery : [room.image];
  const bookHref = `/booking/search?room=${room.slug}`;

  return (
    <>
      <PageIntro eyebrow="Room details" title={room.name} lead={room.short} />

      <Section className="pt-0">
        <div className="room-detail">
          <div className="room-detail__gallery">
            <figure className="room-detail__hero">
              <Image
                src={gallery[0]}
                alt={room.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
            </figure>
            {gallery.slice(1).map((src, index) => (
              <figure key={src} className="room-detail__shot">
                <Image
                  src={src}
                  alt={`${room.name} — gallery ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 30vw"
                />
              </figure>
            ))}
          </div>

          <div className="room-detail__layout">
            <div className="room-detail__main">
              <section className="room-block">
                <h2 className="room-block__title">About this room</h2>
                <p className="room-block__copy">{room.description}</p>
              </section>

              <section className="room-block">
                <h2 className="room-block__title">Room facts</h2>
                <dl className="room-facts">
                  <div>
                    <dt>Maximum occupancy</dt>
                    <dd>Up to {room.guests} guests</dd>
                  </div>
                  <div>
                    <dt>Bed configuration</dt>
                    <dd>{room.beds}</dd>
                  </div>
                  <div>
                    <dt>Room size</dt>
                    <dd>{room.size}</dd>
                  </div>
                  <div>
                    <dt>Availability</dt>
                    <dd>{room.availability}</dd>
                  </div>
                </dl>
              </section>

              <section className="room-block">
                <h2 className="room-block__title">Amenities</h2>
                <ul className="room-list">
                  {room.amenities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="room-block">
                <h2 className="room-block__title">Included services</h2>
                <ul className="room-list">
                  {room.includedServices.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="room-block">
                <h2 className="room-block__title">Policies</h2>
                <ul className="room-list room-list--plain">
                  {room.policies.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="room-block__note">
                  Full terms:{" "}
                  <Link href="/cancellation" className="underline-offset-4 hover:underline">
                    Cancellation Policy
                  </Link>
                  {" · "}
                  <Link href="/terms" className="underline-offset-4 hover:underline">
                    Terms
                  </Link>
                </p>
              </section>

              <section className="room-block">
                <h2 className="room-block__title">Check-in & check-out</h2>
                <dl className="room-facts room-facts--compact">
                  <div>
                    <dt>Check-in</dt>
                    <dd>From {stayInfo.checkIn}</dd>
                  </div>
                  <div>
                    <dt>Check-out</dt>
                    <dd>By {stayInfo.checkOut}</dd>
                  </div>
                </dl>
                <p className="room-block__note">{stayInfo.checkInNote}</p>
                <p className="room-block__note">{stayInfo.checkOutNote}</p>
              </section>
            </div>

            <aside className="room-booking">
              <p className="room-booking__label">Pricing</p>
              <p className="room-booking__price">
                {formatInr(room.price)}
                <span> / night</span>
              </p>
              <p className="room-booking__tax">{stayInfo.taxesNote}</p>

              <dl className="room-booking__meta">
                <div>
                  <dt>Occupancy</dt>
                  <dd>{room.guests} guests max</dd>
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
                  <dt>Check-in / out</dt>
                  <dd>
                    {stayInfo.checkIn} · {stayInfo.checkOut}
                  </dd>
                </div>
              </dl>

              <div className="room-booking__availability">
                <p className="room-booking__avail-label">Availability</p>
                <p>{room.availability}</p>
              </div>

              <ButtonLink href={bookHref} className="room-booking__cta w-full">
                Book Now
              </ButtonLink>
              <Link href="/booking/search" className="room-booking__secondary">
                Check other dates
              </Link>
            </aside>
          </div>
        </div>
      </Section>
    </>
  );
}
