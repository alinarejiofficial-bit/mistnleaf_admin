import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthAuditBridge } from "@/components/auth/AuthAuditBridge";
import { AppFrame } from "@/components/auth/AppFrame";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MistnLeaf Admin",
    template: "%s · MistnLeaf Admin",
  },
  description: "Property operations dashboard for MistnLeaf hospitality.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-foreground">
        <AuthProvider>
          <AuthAuditBridge>
            <AppFrame>{children}</AppFrame>
          </AuthAuditBridge>
        </AuthProvider>
      </body>
    </html>
  );
}
