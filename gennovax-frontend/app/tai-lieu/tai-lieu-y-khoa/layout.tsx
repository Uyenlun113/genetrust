import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { medicalDocs } from "@/data/medicalDocs";
import { absoluteUrl, seoMetadata, siteName } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Tài liệu y khoa về di truyền, NIPT, HPV và sức khỏe sinh sản",
  description:
    "Thư viện tài liệu y khoa về hội chứng di truyền, sàng lọc trước sinh, HPV và các chủ đề sức khỏe liên quan.",
  path: "/tai-lieu/tai-lieu-y-khoa",
  keywords: [
    "tài liệu y khoa",
    "tài liệu di truyền",
    "Patau syndrome",
    "Down syndrome",
    "HPV",
  ],
});

export default function MedicalDocsLayout({
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
          name: "Tài liệu y khoa Genetrust",
          url: absoluteUrl("/tai-lieu/tai-lieu-y-khoa"),
          isPartOf: {
            "@type": "WebSite",
            name: siteName,
            url: absoluteUrl("/"),
          },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: medicalDocs.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.title,
              description: item.summary,
              url: absoluteUrl(`/tai-lieu/tai-lieu-y-khoa/${item.id}`),
            })),
          },
        }}
      />
      {children}
    </>
  );
}
