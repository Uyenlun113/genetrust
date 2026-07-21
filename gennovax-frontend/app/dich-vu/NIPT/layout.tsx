import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { ServicesData } from "@/data/service";
import { absoluteUrl, seoMetadata, siteName } from "@/lib/seo";

const niptServices = ServicesData.filter((item) => item.category === "NIPT");

export const metadata: Metadata = seoMetadata({
  title: "Xét nghiệm NIPT Geni - Sàng lọc trước sinh không xâm lấn",
  description:
    "Dịch vụ xét nghiệm NIPT Geni tại Genetrust giúp sàng lọc nguy cơ bất thường nhiễm sắc thể thai nhi an toàn, không xâm lấn.",
  path: "/dich-vu/NIPT",
  image:
    "/images/huyetthong.png",
  keywords: [
    "xét nghiệm NIPT",
    "sàng lọc trước sinh",
    "NIPT Geni",
    "xét nghiệm dị tật thai nhi",
  ],
});

export default function NiptLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Xét nghiệm NIPT Geni",
          serviceType: "Sàng lọc trước sinh không xâm lấn",
          provider: {
            "@type": "MedicalBusiness",
            name: siteName,
            url: absoluteUrl("/"),
          },
          areaServed: {
            "@type": "Country",
            name: "Việt Nam",
          },
          url: absoluteUrl("/dich-vu/NIPT"),
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Các gói xét nghiệm NIPT",
            itemListElement: niptServices.map((item) => ({
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
