import Link from "next/link";
import { MistnLeafLogo } from "@/components/brand/MistnLeafLogo";
import type { CmsContact, CmsFooter } from "@/lib/cms-data";

type PublicSiteFooterProps = {
  footer: CmsFooter;
  contact: CmsContact;
};

function FooterLinkList({
  links,
  className = "",
}: {
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <ul className={`space-y-2.5 text-sm text-white/75 ${className}`}>
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          {link.href.startsWith("/") && !link.href.startsWith("/#") ? (
            <Link href={link.href} className="hover:text-[#c9b896]">
              {link.label}
            </Link>
          ) : (
            <a href={link.href} className="hover:text-[#c9b896]">
              {link.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export function PublicSiteFooter({ footer, contact }: PublicSiteFooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#0a120e] px-4 py-14 text-white sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <MistnLeafLogo variant="compact" className="max-w-[120px]" />
          <p className="mt-4 text-[11px] tracking-[0.18em] text-[#c9b896] uppercase">
            {footer.brandEyebrow}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/65">{footer.brandDescription}</p>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#c9b896] uppercase">Contact</p>
          <div className="mt-4 space-y-4 text-sm text-white/75">
            <div>
              <p className="text-[10px] tracking-[0.14em] text-white/45 uppercase">Address</p>
              <p className="mt-1 whitespace-pre-line leading-relaxed">{contact.address}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.14em] text-white/45 uppercase">Email</p>
              <a href={`mailto:${contact.email}`} className="mt-1 block hover:text-[#c9b896]">
                {contact.email}
              </a>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.14em] text-white/45 uppercase">Phone</p>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="mt-1 block hover:text-[#c9b896]">
                {contact.phone}
              </a>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#c9b896] uppercase">Explore</p>
          <FooterLinkList links={footer.exploreLinks} className="mt-4" />
        </div>

        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#c9b896] uppercase">Plan</p>
          <FooterLinkList links={footer.planLinks} className="mt-4" />
        </div>

        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#c9b896] uppercase">Policies</p>
          <FooterLinkList links={footer.policyLinks} className="mt-4" />
          <ul className="mt-2.5 space-y-2.5 text-sm text-white/75">
            <li>
              <Link href={footer.staffLoginHref} className="hover:text-[#c9b896]">
                {footer.staffLoginLabel}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-6xl text-center text-xs text-white/40">
        {footer.copyright}
      </p>
    </footer>
  );
}
