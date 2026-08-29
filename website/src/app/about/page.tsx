import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { Logo } from "@/components/Logo";
import { CtaBand, Section } from "@/components/PageShell";
import { media } from "@/lib/media";
import { site } from "@/lib/site";
import "./about-page.css";

export const metadata: Metadata = {
  title: "About Mistnleaf",
  description: site.description,
};

const pillars = [
  {
    index: "01",
    title: "Intentionally small",
    copy: "Fewer rooms mean quieter mornings, closer care, and a stay that never feels hurried.",
  },
  {
    index: "02",
    title: "Forest first",
    copy: "Paths, mist, and canopy light shape the day — we build around the landscape, not over it.",
  },
  {
    index: "03",
    title: "Personal hospitality",
    copy: "Meals, walks, and quiet hours arranged with attention, not a script.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="about-page-hero">
        <div className="about-page-hero__media" aria-hidden>
          <Image
            src={media.aboutLodge}
            alt=""
            fill
            priority
            className="object-cover object-center md:object-[28%_42%]"
            sizes="100vw"
          />
          <div className="about-page-hero__scrim" />
        </div>
        <div className="about-page-hero__content">
          <p className="about-page-hero__eyebrow">Our story</p>
          <Logo size="about" variant="light" href={null} priority className="about-page-hero__logo" />
          <h1 className="about-page-hero__title">
            Soft light, quiet rooms, forest air
          </h1>
          <p className="about-page-hero__lead">
            A small retreat above the Munnar valley — shaped by mist, leaf, and
            the wish for unhurried days.
          </p>
        </div>
      </section>

      <section className="about-page-story">
        <Section className="!py-0">
          <div className="about-page-story__grid">
            <div className="about-page-story__visual">
              <div className="about-page-story__frame">
                <Image
                  src={media.forestWalk}
                  alt="Mist drifting through forest trails near Mistnleaf"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 48vw"
                />
              </div>
            </div>
            <div className="about-page-story__copy">
              <p className="eyebrow">Beginnings</p>
              <h2 className="about-page-story__title">
                Rebuilt slowly for quieter stays
              </h2>
              <div className="about-page-story__prose">
                <p>
                  Mistnleaf began as a family lodge nestled in the hills of
                  Munnar. We rebuilt it slowly — fewer rooms, better light, and
                  hospitality that feels personal rather than performative.
                </p>
                <p>
                  Today we welcome guests who want quiet mornings, forest walks,
                  and meals drawn from local farms and tea estates. Everything
                  here is intentionally small so attention can stay close.
                </p>
                <p>
                  Whether you stay one night or a week, our aim is simple: give
                  you space to breathe between the mist and the leaves.
                </p>
              </div>
            </div>
          </div>
        </Section>
      </section>

      <section className="about-page-pillars">
        <Section>
          <div className="about-page-pillars__intro">
            <p className="eyebrow">How we host</p>
            <h2 className="about-page-pillars__title">
              What we keep close
            </h2>
          </div>
          <div className="about-page-pillars__grid">
            {pillars.map((item) => (
              <article key={item.index} className="about-pillar">
                <p className="about-pillar__index" aria-hidden>
                  {item.index}
                </p>
                <h3 className="about-pillar__title">{item.title}</h3>
                <p className="about-pillar__copy">{item.copy}</p>
              </article>
            ))}
          </div>
        </Section>
      </section>

      <section className="about-page-atmosphere">
        <Section className="!pt-0">
          <div className="about-page-atmosphere__intro">
            <p className="eyebrow">Atmosphere</p>
            <h2 className="about-page-atmosphere__title">
              Light through glass, mist in the trees
            </h2>
            <p className="about-page-atmosphere__lead">
              Lodge mornings, tea-hill afternoons, and evenings when the valley
              softens into fog.
            </p>
          </div>
          <div className="about-page-mosaic">
            <figure className="about-page-mosaic__hero">
              <Image
                src={media.teaEstate}
                alt="Tea estate hills near Mistnleaf"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <figcaption>Tea hills beyond the lodge</figcaption>
            </figure>
            <figure className="about-page-mosaic__side">
              <Image
                src={media.leafBedroom}
                alt="Leaf Room window overlooking misted hills"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <figcaption>Canopy light indoors</figcaption>
            </figure>
            <figure className="about-page-mosaic__wide">
              <Image
                src={media.hero}
                alt="Mist settling over forested hills"
                fill
                className="object-cover"
                sizes="100vw"
              />
              <figcaption>Valley mist at dusk</figcaption>
            </figure>
          </div>
        </Section>
      </section>

      <section className="about-page-place">
        <Section>
          <div className="about-page-place__panel">
            <div>
              <p className="eyebrow">Find us</p>
              <h2 className="about-page-place__title">
                Above the valley in Munnar
              </h2>
              <p className="about-page-place__lead">
                {site.address.line1}
                <br />
                {site.address.line2}
              </p>
              <p className="about-page-place__meta">{site.hours}</p>
              <div className="about-page-place__actions">
                <ButtonLink href="/booking/search">Book your stay</ButtonLink>
                <Link href="/location" className="link-arrow">
                  Get directions
                </Link>
              </div>
            </div>
            <div className="about-page-place__media">
              <Image
                src={media.cottageExterior}
                alt="Mist Cottage among ferns near the lodge"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
          </div>
        </Section>
      </section>

      <CtaBand />
    </>
  );
}
