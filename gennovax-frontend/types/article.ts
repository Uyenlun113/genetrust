export type ArticleCategory = "BLOG" | "FEATURED" | "MEDIA";

export interface ArticleContent {
  heading: string;
  body: string;
}

export interface ArticleItem {
  id: string;
  slug: string;
  category: ArticleCategory;
  title: string;
  date: string;
  author: string;
  tags: string[];
  imageMain: string;
  imageBgr: string;
  excerpt: string;
  content: ArticleContent[];
}
