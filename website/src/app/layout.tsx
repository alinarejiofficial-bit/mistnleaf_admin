import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CmsEditorToolbar } from "@/components/cms/CmsEditorToolbar";
import { getSiteContent } from "@/lib/cms/get-site-content";
import { site } from "@/lib/site";
import "./globals.css";
import "./hero.css";

export const dynamic = "force-dynamic";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} · Staycation`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const content = await getSiteContent();

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="site-bg flex min-h-full flex-col text-ink">
        <Header />
        <Suspense fallback={null}>
          <CmsEditorToolbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer content={content} />
      </body>
    </html>
  );
}
