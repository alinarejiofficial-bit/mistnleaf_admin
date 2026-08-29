import Link from "next/link";

type PageIntroProps = {
  title: string;
  lead: string;
  eyebrow?: string;
};

export function PageIntro({ title, lead, eyebrow }: PageIntroProps) {
  return (
    <header className="mx-auto max-w-3xl px-5 pb-8 pt-24 text-center sm:px-6 md:pb-12 md:pt-36">
      {eyebrow ? (
        <div className="mb-4 flex justify-center">
          <p className="eyebrow inline-flex items-center">{eyebrow}</p>
        </div>
      ) : null}
      <h1 className="font-display text-balance text-[2rem] text-pine sm:text-4xl md:text-5xl lg:text-[3.4rem]">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-muted sm:mt-5 sm:text-base md:text-lg">
        {lead}
      </p>
    </header>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 sm:py-20 md:py-28 ${className}`}
    >
      {children}
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="cta-band" aria-labelledby="cta-band-title">
      <div className="cta-band__panel">
        <div
          aria-hidden
          className="cta-band__glow cta-band__glow--a"
        />
        <div
          aria-hidden
          className="cta-band__glow cta-band__glow--b"
        />
        <div className="cta-band__content">
          <p className="cta-band__eyebrow">Reserve</p>
          <h2 id="cta-band-title" className="cta-band__title">
            Book your stay
          </h2>
          <p className="cta-band__lead">
            Choose your dates, pick a room, and settle into the mist. We will
            guide you through availability and confirmation.
          </p>
          <Link href="/booking/search" className="cta-band__button">
            Start booking
          </Link>
        </div>
      </div>
    </section>
  );
}
