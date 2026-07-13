import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { ServicesData } from "@/data/service";
import { absoluteUrl, seoMetadata, siteName } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Dịch vụ xét nghiệm NIPT, ADN, HPV và di truyền",
  description:
    "Danh mục dịch vụ xét nghiệm Genetrust: sàng lọc trước sinh NIPT, xét nghiệm ADN, HPV, gen lặn và các gói xét nghiệm di truyền.",
  path: "/dich-vu",
  keywords: [
    "dịch vụ xét nghiệm",
    "xét nghiệm NIPT",
    "xét nghiệm ADN",
    "xét nghiệm HPV",
    "xét nghiệm di truyền",
  ],
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Dịch vụ xét nghiệm Genetrust",
          url: absoluteUrl("/dich-vu"),
          isPartOf: {
            "@type": "WebSite",
            name: siteName,
            url: absoluteUrl("/"),
          },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: ServicesData.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              description: item.description,
              url: absoluteUrl("/dich-vu"),
            })),
          },
        }}
      />
      {children}
    </>
  );
}
