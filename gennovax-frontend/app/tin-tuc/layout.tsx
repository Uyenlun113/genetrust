import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl, seoMetadata, siteName } from "@/lib/seo";
import { patauArticle } from "@/data/articals";

function getArticleTime(date: string) {
  const match = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return 0;

  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

const sortedArticles = [...patauArticle].sort(
  (a, b) => getArticleTime(b.date) - getArticleTime(a.date),
);

export const metadata: Metadata = seoMetadata({
  title: "Tin tức y tế, xét nghiệm di truyền và sức khỏe thai kỳ",
  description:
    "Cập nhật kiến thức y tế, sàng lọc trước sinh, xét nghiệm ADN, HPV và các bài viết chuyên môn từ Genetrust.",
  path: "/tin-tuc",
  keywords: [
    "tin tức y tế",
    "xét nghiệm di truyền",
    "sàng lọc trước sinh",
    "xét nghiệm ADN",
    "xét nghiệm HPV",
  ],
});

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tin tức Genetrust",
          url: absoluteUrl("/tin-tuc"),
          isPartOf: {
            "@type": "WebSite",
            name: siteName,
            url: absoluteUrl("/"),
          },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: sortedArticles.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/tin-tuc/${item.slug}`),
              name: item.title,
            })),
          },
        }}
      />
      {children}
    </>
  );
}
