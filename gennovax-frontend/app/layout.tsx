import type { Metadata } from "next";
import "./globals.css";

import ClientLayout from "@/components/layout/clientLayout";
import JsonLd from "@/components/JsonLd";
import {
  defaultDescription,
  defaultTitle,
  siteName,
  siteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased bg-white text-gray-800">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "MedicalBusiness",
            name: siteName,
            url: siteUrl,
            logo: `${siteUrl}/images/genetrust-logo.png`,
            email: "info@genetrust.vn",
            sameAs: ["https://www.facebook.com/profile.php?id=61576103516877"],
            medicalSpecialty: [
              "Genetic",
              "Obstetric",
              "Gynecologic",
              "Pathology",
            ],
            areaServed: {
              "@type": "Country",
              name: "Việt Nam",
            },
          }}
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
