import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { ServicesData } from "@/data/service";
import { absoluteUrl, seoMetadata, siteName } from "@/lib/seo";

const hpvServices = ServicesData.filter((item) => item.category === "HPV");

export const metadata: Metadata = seoMetadata({
  title: "Xét nghiệm HPV - Tầm soát nguy cơ ung thư cổ tử cung",
  description:
    "Dịch vụ xét nghiệm HPV, Cell Prep và các gói tầm soát nguy cơ ung thư cổ tử cung tại Genetrust.",
  path: "/dich-vu/HPV",
  image:
    "/images/huyetthong.png",
  keywords: [
    "xét nghiệm HPV",
    "tầm soát ung thư cổ tử cung",
    "HPV 23 type",
    "HPV 40 type",
    "Cell Prep",
  ],
});

export default function HpvLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Xét nghiệm HPV",
          serviceType: "Tầm soát HPV và nguy cơ ung thư cổ tử cung",
          provider: {
            "@type": "MedicalBusiness",
            name: siteName,
            url: absoluteUrl("/"),
          },
          areaServed: {
            "@type": "Country",
            name: "Việt Nam",
          },
          url: absoluteUrl("/dich-vu/HPV"),
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Các gói xét nghiệm HPV",
            itemListElement: hpvServices.map((item) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: item.name,
                description: item.description,
              },
              price: item.price,
              priceCurrency: "VND",
            })),
          },
        }}
      />
      {children}
    </>
  );
}
