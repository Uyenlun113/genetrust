"use client";

import React from "react";
// import Image from 'next/image'; // Nên dùng 'next/image' khi deploy

// Danh sách các ảnh sẽ hiển thị
// Sắp xếp: 2 ảnh đội ngũ, sau đó 2 ảnh chứng nhận
const galleryImages = [
  {
    src: "https://res.cloudinary.com/da6f4dmql/image/upload/v1765784252/Ho%CC%82%CC%80_so%CC%9B_na%CC%86ng_lu%CC%9B%CC%A3c_Gennovax_12_1_1_daghh7.png",
    alt: "Đội ngũ chuyên viên cố vấn Genetrust 1",
  },
  {
    src: "https://res.cloudinary.com/da6f4dmql/image/upload/v1765784316/Ho%CC%82%CC%80_so%CC%9B_na%CC%86ng_lu%CC%9B%CC%A3c_Gennovax_10_1_1_xlubi0.png",
    alt: "Đội ngũ chuyên viên cố vấn Genetrust 2",
  },
];

// Màu sắc
const brandColors = {
  primary: "#0D47A1",
};

export default function ExpertsAndAchievements() {
  return (
    <section
      id="doi-ngu-va-thanh-tuu"
      className="w-full bg-gray-50 py-24" // Nền xám nhạt
    >
      <div className="container mx-auto max-w-7xl px-4">
        <h2
          className="mb-16 text-center text-4xl font-extrabold"
          style={{ color: brandColors.primary }}
        >
          Đội ngũ chuyên viên cố vấn chuyên môn cao
        </h2>

        {/* Gallery ảnh */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {galleryImages.map((image) => (
            <div
              key={image.src}
              className="rounded-xl bg-white p-4 shadow-xl transition-shadow duration-300 hover:shadow-2xl"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full rounded-lg object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
