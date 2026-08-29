"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { navLinks } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/staff")) {
    return null;
  }

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled || open
          ? "border-b border-line/70 bg-fog/90 shadow-[0_10px_40px_-28px_rgba(26,39,28,0.45)] backdrop-blur-md"
          : "bg-fog/55 backdrop-blur-sm"
      }`}
    >
      <div className="site-header__inner">
        <div className="mr-auto shrink-0">
          <Logo size="header" priority onClick={() => setOpen(false)} />
        </div>

        <nav className="site-header__nav">
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav-link transition ${
                  active ? "text-pine" : "text-muted/90 hover:text-pine"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/booking/search" className="site-nav-cta site-nav-book">
            Book my room
          </Link>
        </nav>

        <button
          type="button"
          className="site-nav-cta inline-flex min-h-9 shrink-0 items-center justify-center border border-line px-3.5 py-2 text-pine transition hover:bg-sand-cool/60 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-fog/95 px-[var(--page-gutter)] py-5 backdrop-blur-md xl:hidden"
        >
          <nav className="mx-auto flex max-w-[var(--page-max)] flex-col gap-0.5">
            {navLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`site-nav-link border-b border-line/60 py-3.5 ${
                    active ? "text-pine" : "text-muted hover:text-pine"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/booking/search"
              className="site-nav-cta site-nav-book mt-4 w-full"
              onClick={() => setOpen(false)}
            >
              Book my room
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
