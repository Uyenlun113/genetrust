import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { medicalDocs } from "@/data/medicalDocs";
import { absoluteUrl, seoMetadata, siteName } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

async function getDoc(params: Props["params"]) {
  const { slug } = await params;
  return medicalDocs.find((item) => item.id === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Props["params"];
}): Promise<Metadata> {
  const doc = await getDoc(params);

  if (!doc) {
    return seoMetadata({
      title: "Không tìm thấy tài liệu",
      description: "Tài liệu y khoa không tồn tại hoặc đã được di chuyển.",
      path: "/tai-lieu/tai-lieu-y-khoa",
    });
  }

  return seoMetadata({
    title: doc.title,
    description: doc.summary,
    path: `/tai-lieu/tai-lieu-y-khoa/${doc.id}`,
    image: doc.sections.find((section) => section.image)?.image,
    type: "article",
    keywords: [doc.title, "tài liệu y khoa", "Genetrust"],
  });
}

export async function generateStaticParams() {
  return medicalDocs.map((item) => ({ slug: item.id }));
}

export default async function MedicalDocLayout({ children, params }: Props) {
  const doc = await getDoc(params);

  if (!doc) return <>{children}</>;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: doc.title,
          description: doc.summary,
          url: absoluteUrl(`/tai-lieu/tai-lieu-y-khoa/${doc.id}`),
          publisher: {
            "@type": "Organization",
            name: siteName,
            logo: {
              "@type": "ImageObject",
              url: absoluteUrl("/images/genetrust-logo.png"),
            },
          },
          reviewedBy: {
            "@type": "Organization",
            name: siteName,
          },
          mainContentOfPage: doc.sections.map((section) => section.heading),
          inLanguage: "vi-VN",
        }}
      />
      {children}
    </>
  );
}
