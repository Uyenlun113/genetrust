import type { Metadata } from "next";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://genetrust.vn"
).replace(/\/$/, "");

export const siteName = "Genetrust";
export const defaultTitle =
  "Genetrust - Dịch vụ xét nghiệm di truyền, NIPT, ADN và HPV";
export const defaultDescription =
  "Genetrust cung cấp các giải pháp xét nghiệm di truyền, sàng lọc trước sinh NIPT, xét nghiệm ADN, HPV và tư vấn y học cá thể hóa.";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function seoMetadata({
  title,
  description,
  path,
  image = "/images/genetrust-logo.png",
  type = "website",
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "vi_VN",
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
