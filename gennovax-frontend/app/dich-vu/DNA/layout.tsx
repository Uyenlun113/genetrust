import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { ServicesData } from "@/data/service";
import { absoluteUrl, seoMetadata, siteName } from "@/lib/seo";

const dnaServices = ServicesData.filter((item) => item.category === "ADN");

export const metadata: Metadata = seoMetadata({
  title: "Xét nghiệm ADN huyết thống - Chính xác, bảo mật",
  description:
    "Dịch vụ xét nghiệm ADN huyết thống, ADN trước sinh không xâm lấn và các giải pháp xác minh quan hệ cha con tại Genetrust.",
  path: "/dich-vu/DNA",
  image: "/images/ADN/Ảnh web-11.png",
  keywords: [
    "xét nghiệm ADN",
    "xét nghiệm ADN huyết thống",
    "xét nghiệm ADN cha con",
    "ADN trước sinh",
  ],
});

export default function DnaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Xét nghiệm ADN huyết thống",
          serviceType: "Xét nghiệm ADN",
          provider: {
            "@type": "MedicalBusiness",
            name: siteName,
            url: absoluteUrl("/"),
          },
          areaServed: {
            "@type": "Country",
            name: "Việt Nam",
          },
          url: absoluteUrl("/dich-vu/DNA"),
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Các gói xét nghiệm ADN",
            itemListElement: dnaServices.map((item) => ({
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
