"use client";

import React, { useState } from "react";
import { Calendar, Tag, ArrowRight, Facebook } from "lucide-react";
import { useRouter } from "next/navigation";
import { patauArticle } from "@/data/articals";
import type { ArticleItem } from "@/types/article";

function getArticleTime(date: string) {
  const match = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return 0;

  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

const newsData: ArticleItem[] = [...patauArticle].sort(
  (a, b) => getArticleTime(b.date) - getArticleTime(a.date),
);

const categories = [
  { key: "ALL", label: "Tất cả" },
  { key: "BLOG", label: "Blog" },
  { key: "FEATURED", label: "Tin nổi bật" },
  { key: "MEDIA", label: "Tin truyền thông" },
] as const;

const NewsHeader = () => (
  <div
    className="relative w-full pt-12 pb-10 text-center shadow-lg md:pt-16 md:pb-12"
    style={{ backgroundImage: "url('/images/bgrHome.jpg')" }}
  >
    <div className="absolute inset-0 overflow-hidden opacity-10"></div>

    <div className="relative z-10 container mx-auto px-4">
      <h1 className="text-2xl font-bold uppercase tracking-wide text-white md:text-4xl">
        TIN TỨC Y TẾ NỔI BẬT
      </h1>
    </div>
  </div>
);

const NewsCard = ({ item }: { item: ArticleItem }) => {
  const router = useRouter();

  return (
    <div className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition hover:shadow-xl">
      <div className="flex h-full max-h-[300px] flex-col md:flex-row">
        <div className="relative aspect-video w-[0] overflow-hidden md:w-[45%] md:aspect-auto">
          <img
            src={item.imageMain}
            alt={item.title}
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-[#00ACC1] shadow-sm backdrop-blur-sm md:hidden">
            {item.tags[0]}
          </div>
        </div>

        <div className="flex w-full flex-col justify-between p-5 md:w-[55%]">
          <div onClick={() => router.push(`/tin-tuc/${item.slug}`)}>
            <div className="mb-2 hidden items-center gap-1 text-sm text-gray-500 md:flex">
              <Tag className="h-4 w-4" />
              <span className="line-clamp-1">{item.tags.join(", ")}</span>
            </div>

            <h2 className="mb-3 line-clamp-2 text-xl leading-tight font-semibold text-[#00ACC1] transition-colors group-hover:text-[#00838F] md:text-2xl">
              {item.title}
            </h2>

            <div className="mb-3 flex items-center text-xs text-gray-400 md:hidden">
              <Calendar className="mr-1 h-3 w-3" />
              {item.date}
            </div>

            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600 md:text-base">
              {item.excerpt}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="hidden items-center text-sm text-gray-400 md:flex">
              <Calendar className="mr-1 h-4 w-4" />
              {item.date}
            </div>

            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
              <div className="hidden gap-2 sm:flex">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[#3b5998] transition-all hover:bg-[#3b5998] hover:text-white">
                  <Facebook size={16} />
                </button>
              </div>

              <button
                onClick={() => router.push(`/tin-tuc/${item.slug}`)}
                className="group/btn flex items-center gap-2 text-sm font-bold text-[#00BCD4] transition hover:text-[#0097A7]"
              >
                Đọc tiếp
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MedicalNewsPage() {
  const [activeTab, setActiveTab] = useState<
    (typeof categories)[number]["key"]
  >("ALL");

  const filteredNews =
    activeTab === "ALL"
      ? newsData
      : newsData.filter((item) => item.category === activeTab);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NewsHeader />

      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="scrollbar-hide flex items-center gap-6 overflow-x-auto whitespace-nowrap py-4 md:justify-center">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`relative px-1 py-1 text-sm font-medium transition-colors duration-200 md:text-base ${
                  activeTab === cat.key
                    ? "text-[#00ACC1]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {cat.label}
                {activeTab === cat.key && (
                  <span className="absolute left-0 -bottom-[10px] h-[3px] w-full rounded-t-sm bg-[#00ACC1]"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-4 w-full border-b-2 border-dashed border-gray-200/60 md:mb-8"></div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
          {filteredNews.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </main>
  );
}
