import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { media } from "@/lib/media";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="hero" aria-label="Mistnleaf retreat">
      <div className="hero-stage" aria-hidden>
        <div className="hero-bg-motion">
          <Image
            src={media.hero}
            alt=""
            fill
            priority
            className="hero-bg object-cover"
            sizes="100vw"
          />
        </div>
        <div className="hero-light">
          <div className="hero-light__sun" />
          <div className="hero-light__rays" />
          <div className="hero-light__wash" />
        </div>
        <div className="hero-scrim" />
      </div>

      <div className="hero-content">
        <div className="hero-copy">
          <p className="hero-eyebrow">Staycation</p>
          <h1 className="hero-title">{site.tagline}</h1>
          <p className="hero-lead">
            A forest retreat where slow mornings, soft light, and thoughtful
            hospitality meet.
          </p>
          <div className="hero-actions">
            <ButtonLink href="/booking/search" className="hero-cta rounded-xl">
              Book your stay
            </ButtonLink>
            <ButtonLink
              href="/rooms"
              variant="secondary"
              className="hero-cta hero-cta--ghost rounded-xl"
            >
              Explore rooms
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="hero-mist" aria-hidden>
        <div className="hero-mist__veil hero-mist__veil--left">
          <span className="hero-mist__bloom hero-mist__bloom--l1" />
          <span className="hero-mist__bloom hero-mist__bloom--l2" />
          <span className="hero-mist__bloom hero-mist__bloom--l3" />
        </div>
        <div className="hero-mist__veil hero-mist__veil--right">
          <span className="hero-mist__bloom hero-mist__bloom--r1" />
          <span className="hero-mist__bloom hero-mist__bloom--r2" />
          <span className="hero-mist__bloom hero-mist__bloom--r3" />
        </div>
        <div className="hero-mist__haze" />
      </div>
    </section>
  );
}
