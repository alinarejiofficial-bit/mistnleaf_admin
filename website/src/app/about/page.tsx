import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { CmsSectionEdit } from "@/components/cms/CmsSectionEdit";
import { Logo } from "@/components/Logo";
import { CtaBand, Section } from "@/components/PageShell";
import { getSiteContent } from "@/lib/cms/get-site-content";
import "./about-page.css";

export const metadata: Metadata = {
  title: "About Mistnleaf",
  description: "Our story — a quiet forest retreat above the Munnar valley.",
};

export default async function AboutPage() {
  const content = await getSiteContent();
  const { about } = content;
  const placeLines = about.placeLead
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      <section className="about-page-hero relative">
        <Suspense fallback={null}>
          <CmsSectionEdit section="about" label="About" />
        </Suspense>
        <div className="about-page-hero__media" aria-hidden>
          <Image
            src={about.image}
            alt=""
            fill
            priority
            className="object-cover object-center md:object-[28%_42%]"
            sizes="100vw"
            unoptimized={about.image.startsWith("http")}
          />
          <div className="about-page-hero__scrim" />
        </div>
        <div className="about-page-hero__content">
          <p className="about-page-hero__eyebrow">{about.pageEyebrow}</p>
          <Logo size="about" variant="light" href={null} priority className="about-page-hero__logo" />
          <h1 className="about-page-hero__title">{about.title}</h1>
          <p className="about-page-hero__lead">{about.lead}</p>
        </div>
      </section>

      <section className="about-page-story">
        <Section className="!py-0">
          <div className="about-page-story__grid">
            <div className="about-page-story__visual">
              <div className="about-page-story__frame">
                <Image
                  src={about.storyImage}
                  alt="Mist drifting through forest trails near Mistnleaf"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 48vw"
                  unoptimized={about.storyImage.startsWith("http")}
                />
              </div>
            </div>
            <div className="about-page-story__copy">
              <p className="eyebrow">{about.storyEyebrow}</p>
              <h2 className="about-page-story__title">{about.storyTitle}</h2>
              <div
                className="about-page-story__prose"
                dangerouslySetInnerHTML={{ __html: about.storyHtml }}
              />
              {about.ctaLabel ? (
                <Link href="/contact" className="link-arrow mt-6 inline-flex">
                  {about.ctaLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </Section>
      </section>

      <section className="about-page-pillars">
        <Section>
          <div className="about-page-pillars__intro">
            <p className="eyebrow">{about.pillarsEyebrow}</p>
            <h2 className="about-page-pillars__title">{about.pillarsTitle}</h2>
          </div>
          <div className="about-page-pillars__grid">
            {about.pillars.map((item, index) => (
              <article key={item.id} className="about-pillar">
                <p className="about-pillar__index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
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
            <p className="eyebrow">{about.atmosphereEyebrow}</p>
            <h2 className="about-page-atmosphere__title">{about.atmosphereTitle}</h2>
            <p className="about-page-atmosphere__lead">{about.atmosphereLead}</p>
          </div>
          <div className="about-page-mosaic">
            {about.mosaic.map((item, index) => {
              const mosaicClass =
                index === 0
                  ? "about-page-mosaic__hero"
                  : index === 1
                    ? "about-page-mosaic__side"
                    : "about-page-mosaic__wide";
              return (
                <figure key={item.id} className={mosaicClass}>
                  <Image
                    src={item.image}
                    alt={item.caption}
                    fill
                    className="object-cover"
                    sizes={
                      index === 0
                        ? "(max-width: 768px) 100vw, 60vw"
                        : index === 1
                          ? "(max-width: 768px) 100vw, 40vw"
                          : "100vw"
                    }
                    unoptimized={item.image.startsWith("http")}
                  />
                  <figcaption>{item.caption}</figcaption>
                </figure>
              );
            })}
          </div>
        </Section>
      </section>

      <section className="about-page-place">
        <Section>
          <div className="about-page-place__panel">
            <div>
              <p className="eyebrow">{about.placeEyebrow}</p>
              <h2 className="about-page-place__title">{about.placeTitle}</h2>
              <p className="about-page-place__lead">
                {placeLines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              {about.placeMeta ? (
                <p className="about-page-place__meta">{about.placeMeta}</p>
              ) : null}
              <div className="about-page-place__actions">
                <ButtonLink href="/booking/search">{about.placeCtaLabel}</ButtonLink>
                <Link href="/location" className="link-arrow">
                  {about.placeDirectionsLabel}
                </Link>
              </div>
            </div>
            <div className="about-page-place__media">
              <Image
                src={about.placeImage}
                alt="Mist Cottage among ferns near the lodge"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
                unoptimized={about.placeImage.startsWith("http")}
              />
            </div>
          </div>
        </Section>
      </section>

      <CtaBand />
    </>
  );
}
