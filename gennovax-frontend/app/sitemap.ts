import type { MetadataRoute } from "next";
import { patauArticle } from "@/data/articals";
import { medicalDocs } from "@/data/medicalDocs";
import { absoluteUrl } from "@/lib/seo";

function parseArticleDate(value: string) {
  const match = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return new Date();

  const [, day, month, year] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    8,
    0,
    0,
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/ve-genetrust"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/dich-vu"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/dich-vu/NIPT"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/dich-vu/DNA"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/dich-vu/HPV"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/tin-tuc"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/gioi-thieu/doi-ngu-bac-sy"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: absoluteUrl("/gioi-thieu/danh-sach-phong-kham"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/gioi-thieu/doi-tac-phat-trien"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/tai-lieu/tai-lieu-y-khoa"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = [...patauArticle]
    .sort(
      (a, b) =>
        parseArticleDate(b.date).getTime() -
        parseArticleDate(a.date).getTime(),
    )
    .map((article) => ({
      url: absoluteUrl(`/tin-tuc/${article.slug}`),
      lastModified: parseArticleDate(article.date),
      changeFrequency: "monthly",
      priority: 0.75,
    }));

  const medicalDocRoutes: MetadataRoute.Sitemap = medicalDocs.map((doc) => ({
    url: absoluteUrl(`/tai-lieu/tai-lieu-y-khoa/${doc.id}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...articleRoutes, ...medicalDocRoutes];
}
