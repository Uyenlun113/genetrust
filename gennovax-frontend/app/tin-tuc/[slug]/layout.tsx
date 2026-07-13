import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl, seoMetadata, siteName } from "@/lib/seo";
import { patauArticle } from "@/data/articals";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

function parseArticleDate(value: string) {
  const match = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return undefined;

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

async function getArticle(params: Props["params"]) {
  const { slug } = await params;
  return patauArticle.find((item) => item.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Props["params"];
}): Promise<Metadata> {
  const article = await getArticle(params);

  if (!article) {
    return seoMetadata({
      title: "Không tìm thấy bài viết",
      description: "Bài viết không tồn tại hoặc đã được di chuyển.",
      path: "/tin-tuc",
    });
  }

  return seoMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/tin-tuc/${article.slug}`,
    image: article.imageMain,
    type: "article",
    keywords: article.tags,
  });
}

export async function generateStaticParams() {
  return patauArticle.map((item) => ({ slug: item.slug }));
}

export default async function ArticleLayout({ children, params }: Props) {
  const article = await getArticle(params);

  if (!article) return <>{children}</>;

  const publishedDate = parseArticleDate(article.date);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          image: [article.imageMain],
          author: {
            "@type": "Organization",
            name: article.author || siteName,
          },
          publisher: {
            "@type": "Organization",
            name: siteName,
            logo: {
              "@type": "ImageObject",
              url: absoluteUrl("/images/genetrust-logo.png"),
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": absoluteUrl(`/tin-tuc/${article.slug}`),
          },
          datePublished: publishedDate,
          dateModified: publishedDate,
          keywords: article.tags.join(", "),
          articleSection: article.tags[0],
          inLanguage: "vi-VN",
        }}
      />
      {children}
    </>
  );
}
