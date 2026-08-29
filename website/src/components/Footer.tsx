"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

const explore = [
  { href: "/about", label: "About" },
  { href: "/rooms", label: "Rooms" },
  { href: "/experiences", label: "Experiences" },
  { href: "/amenities", label: "Amenities" },
  { href: "/dining", label: "Dining" },
  { href: "/gallery", label: "Gallery" },
];

const plan = [
  { href: "/offers", label: "Offers" },
  { href: "/things-to-do", label: "Things to Do" },
  { href: "/explore", label: "Site guide" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact / Enquiry" },
  { href: "/booking/search", label: "Check availability" },
];

const policies = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/cancellation", label: "Cancellation Policy" },
  { href: "/staff/login", label: "Staff login" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="site-footer__col">
      <p className="site-footer__heading">{title}</p>
      <nav className="site-footer__nav" aria-label={title}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="site-footer__link">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/staff")) return null;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo size="footer" variant="light" href={null} />
          <p className="site-footer__tagline">{site.tagline}</p>
          <p className="site-footer__about">{site.description}</p>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__heading">Contact</p>
          <address className="site-footer__contact not-italic">
            <p className="site-footer__contact-line">
              <span className="site-footer__contact-label">Address</span>
              {site.address.line1}
              <br />
              {site.address.line2}
            </p>
            <p className="site-footer__contact-line">
              <span className="site-footer__contact-label">Email</span>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <p className="site-footer__contact-line">
              <span className="site-footer__contact-label">Phone</span>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            </p>
          </address>
        </div>

        <FooterColumn title="Explore" links={explore} />
        <FooterColumn title="Plan" links={plan} />
        <FooterColumn title="Policies" links={policies} />
      </div>

      <div className="site-footer__bar">
        <p>
          © {new Date().getFullYear()} {site.name}. Nature in every breath.
        </p>
      </div>
    </footer>
  );
}
