import Image from "next/image";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { Hero } from "@/components/home/Hero";
import { CtaBand, Section } from "@/components/PageShell";
import { media } from "@/lib/media";
import {
  amenities,
  experiences,
  faqs,
  formatInr,
  galleryImages,
  offers,
  rooms,
  site,
  testimonials,
} from "@/lib/site";

function SectionHeading({
  eyebrow,
  title,
  lead,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-9 text-center sm:mb-12 md:mb-14">
      <div className="mx-auto max-w-2xl">
        <div className="flex justify-center">
          <p className="eyebrow">{eyebrow}</p>
        </div>
        <h2 className="mt-3 font-display text-balance text-[1.85rem] text-pine sm:mt-4 sm:text-3xl md:text-[2.75rem]">
          {title}
        </h2>
        {lead ? (
          <p className="mx-auto mt-3 max-w-xl text-[0.98rem] leading-relaxed text-muted sm:mt-4 sm:text-[1.02rem]">
            {lead}
          </p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <div className="mt-5 flex justify-center sm:mt-6">
          <Link href={href} className="link-arrow">
            {linkLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="about-band">
        <Section className="!py-0">
          <div className="about-grid">
            <div className="about-copy">
              <p className="eyebrow">About Mistnleaf</p>
              <h2 className="about-title">
                Soft light, quiet rooms, forest air
              </h2>
              <p className="about-lead">
                Mistnleaf sits above the valley where morning fog settles
                between the trees. We keep the stay intentionally small —
                thoughtful rooms, seasonal dining, and hospitality that feels
                personal.
              </p>
              <Link href="/about" className="link-arrow about-link">
                Read our story
              </Link>
            </div>
            <div className="about-visual">
              <div className="about-media">
                <Image
                  src={media.aboutLodge}
                  alt="Glass hillside lodge overlooking misty mountain valleys at Mistnleaf"
                  fill
                  className="object-cover object-center sm:object-[28%_42%]"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </Section>
      </section>

      <section className="band-soft">
        <Section>
          <SectionHeading
            eyebrow="Stay"
            title="Featured Rooms"
            lead="Suites and cottages shaped for rest, with forest light and soft linens."
            href="/rooms"
            linkLabel="View all rooms"
          />
          <div className="grid gap-8 md:grid-cols-3 md:gap-7">
            {rooms.map((room) => (
              <Link
                key={room.slug}
                href={`/rooms/${room.slug}`}
                className="group"
              >
                <div className="img-frame relative aspect-[5/4] rounded-xl sm:aspect-[4/5] sm:rounded-2xl">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="mt-4 sm:mt-5">
                  <h3 className="font-display text-[1.45rem] text-pine transition group-hover:text-pine-soft sm:text-2xl">
                    {room.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {room.short}
                  </p>
                  <p className="mt-3 text-[0.8rem] uppercase tracking-[0.12em] text-leaf sm:mt-4">
                    From {formatInr(room.price)} / night
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </section>

      <section className="experiences-band">
        <Section>
          <SectionHeading
            eyebrow="Do"
            title="Experiences"
            lead="Optional rituals for your stay — walks, tea, and quiet evenings."
            href="/experiences"
            linkLabel="All experiences"
          />
          <div className="experiences-grid">
            {experiences.slice(0, 4).map((item, index) => (
              <article key={item.title} className="experience-card group">
                <div className="experience-media img-frame">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span className="experience-index" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="experience-body">
                  <p className="experience-duration">{item.duration}</p>
                  <h3 className="experience-title">{item.title}</h3>
                  <p className="experience-copy">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>
      </section>

      <section className="band-mist">
        <Section>
          <SectionHeading
            eyebrow="Comforts"
            title="Amenities"
            lead="Shared spaces for rest between walks, meals, and quiet hours."
            href="/amenities"
            linkLabel="Explore amenities"
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {amenities.map((item) => (
              <article key={item.title} className="group">
                <div className="img-frame relative aspect-[4/3] rounded-xl sm:rounded-2xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="mt-4 font-display text-[1.45rem] text-pine sm:mt-5 sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </Section>
      </section>

      <section className="gallery-band">
        <div className="gallery-mist" aria-hidden>
          <span className="gallery-mist__cloud gallery-mist__cloud--a" />
          <span className="gallery-mist__cloud gallery-mist__cloud--b" />
        </div>
        <Section>
          <div className="gallery-intro">
            <p className="eyebrow">Look</p>
            <h2 className="gallery-intro__title">A quiet visual diary</h2>
            <p className="gallery-intro__lead">
              Soft light through glass, mist in the trees, and rooms shaped for
              unhurried mornings.
            </p>
            <Link href="/gallery" className="link-arrow gallery-intro__link">
              Full gallery
            </Link>
          </div>

          <div className="gallery-mosaic">
            {galleryImages.slice(0, 7).map((image, index) => {
              const roles = [
                "gallery-tile--hero",
                "gallery-tile--side",
                "gallery-tile--side",
                "gallery-tile--wide",
                "gallery-tile--square",
                "gallery-tile--square",
                "gallery-tile--panorama",
              ] as const;
              return (
                <figure
                  key={`${image.src}-${index}`}
                  className={`gallery-tile group ${roles[index]}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="gallery-tile__img object-cover"
                    sizes={
                      index === 0
                        ? "(max-width: 768px) 100vw, 55vw"
                        : index === 6
                          ? "100vw"
                          : "(max-width: 639px) 100vw, (max-width: 768px) 50vw, 33vw"
                    }
                  />
                  <span className="gallery-tile__index" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <figcaption className="gallery-tile__caption">
                    <span className="gallery-tile__label">
                      {image.label ?? image.alt}
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </Section>
      </section>

      <section className="packages-band">
        <Section>
          <SectionHeading
            eyebrow="Packages"
            title="Offers & Packages"
            lead="Thoughtful combinations of stay, meals, and experiences."
            href="/offers"
            linkLabel="View offers"
          />
          <div className="border-y border-line">
            {offers.map((offer, index) => (
              <article key={offer.title} className="offer-panel">
                <p className="offer-index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="min-w-0 max-w-xl">
                  <h3 className="font-display text-2xl text-pine md:text-[2rem]">
                    {offer.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted">
                    {offer.detail}
                  </p>
                  <p className="mt-3 text-[0.72rem] uppercase tracking-[0.16em] text-lichen">
                    {offer.valid}
                  </p>
                </div>
                <div className="md:min-w-[9.5rem] md:text-right">
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">
                    From
                  </p>
                  <p className="mt-1 font-display text-3xl text-pine">
                    {formatInr(offer.priceFrom)}
                  </p>
                  <Link href="/booking/search" className="link-arrow mt-4">
                    Book package
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Section>
      </section>

      <section className="location-band">
        <div className="location-band__media" aria-hidden>
          <Image
            src={media.locationHills}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="location-band__content mx-auto flex min-h-[24rem] max-w-6xl flex-col items-center justify-end px-5 py-12 text-center sm:px-6 sm:py-16 md:min-h-[34rem] md:py-24">
          <div className="max-w-xl text-fog">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-fog/60">
              Location
            </p>
            <h2 className="mt-3 font-display text-balance text-[1.85rem] sm:mt-4 sm:text-3xl md:text-[2.75rem]">
              Above the valley in Munnar
            </h2>
            <p className="mt-3 leading-relaxed text-fog/80 sm:mt-4">
              Nestled near Whispering Pines — close enough to town, far enough
              for quiet. Private transfers can be arranged when you book.
            </p>
            <div className="mt-6 grid w-full gap-4 text-sm text-fog/85 sm:mt-7 sm:grid-cols-2 sm:gap-x-8">
              <p className="text-center sm:text-left">
                <span className="block text-[0.65rem] uppercase tracking-[0.16em] text-fog/50">
                  Address
                </span>
                {site.address.line1}
                <br />
                {site.address.line2}
              </p>
              <p className="text-center sm:text-left">
                <span className="block text-[0.65rem] uppercase tracking-[0.16em] text-fog/50">
                  Airport
                </span>
                ~3.5–4 hrs from COK
              </p>
            </div>
            <Link
              href="/location"
              className="mt-7 inline-flex items-center gap-2 text-sm tracking-wide text-fog transition hover:gap-3 sm:mt-8"
            >
              Get directions
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="guests-band">
        <div className="guests-mist" aria-hidden>
          <span className="guests-mist__cloud guests-mist__cloud--a" />
          <span className="guests-mist__cloud guests-mist__cloud--b" />
          <span className="guests-mist__cloud guests-mist__cloud--c" />
        </div>
        <Section>
          <SectionHeading
            eyebrow="Guests"
            title="Guest Testimonials"
            lead="Words from travellers who stayed among the mist and leaves."
          />
          <div className="guests-grid">
            {testimonials.map((item, index) => (
              <blockquote
                key={item.name}
                className={`testimonial-panel testimonial-panel--${index + 1}`}
              >
                <span className="testimonial-index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="testimonial-mark" aria-hidden>
                  “
                </span>
                <p className="testimonial-quote">{item.quote}</p>
                <footer className="testimonial-footer">
                  <span className="testimonial-avatar" aria-hidden>
                    {item.name
                      .split(/[\s&]+/)
                      .filter(Boolean)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span>
                    <span className="testimonial-name">{item.name}</span>
                    <span className="testimonial-place">{item.place}</span>
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </Section>
      </section>

      <section className="faq-band">
        <Section>
          <SectionHeading
            eyebrow="Help"
            title="Frequently asked questions"
            lead="Quick answers before you arrive — check-in, transfers, dining, and more."
            href="/faqs"
            linkLabel="View all FAQs"
          />
          <FaqList items={faqs.slice(0, 4)} className="faq-list--home" />
        </Section>
      </section>

      <CtaBand />
    </>
  );
}
