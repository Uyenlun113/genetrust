"use client";

import React from "react";
// import Image from 'next/image'; // Nên dùng 'next/image' khi deploy
import {
  Building, // Icon Bệnh viện
  Cpu, // Icon Thiết bị/Công nghệ
  CheckSquare, // Icon Tiêu chuẩn
} from "lucide-react";

// --- DỮ LIỆU TỔNG HỢP ---

// 1. Đối Tác Chiến Lược
const partnersData = {
  image:
    "https://res.cloudinary.com/da6f4dmql/image/upload/v1765533226/Ho%CC%82%CC%80_so%CC%9B_na%CC%86ng_lu%CC%9B%CC%A3c_Gennovax_15_1_1_pm7non.png",
  title: "Đối Tác Chiến Lược Uy Tín",
  description:
    "Chúng tôi xây dựng niềm tin dựa trên sự hợp tác chặt chẽ với các đối tác y tế, bệnh viện, viện nghiên cứu hàng đầu trong nước và quốc tế.",
  stats: [
    {
      icon: Building,
      text: "Đối tác bệnh viện lớn: Bạch Mai, ĐH Y Hà Nội, Hoàn Mỹ...",
    },
    {
      icon: Cpu,
      text: "Đối tác phát triển di truyền: Genlab, Genolife, Oh, Midilab, Phacgen...",
    },
    {
      icon: Cpu,
      text: "Đối tác công nghệ: Illumina, Thermo Fisher, Qiagen, Bio-Rad...",
    },
  ],
};

// 2. Thiết Bị & Tiêu Chuẩn Lab
const equipmentData = {
  image:
    "https://res.cloudinary.com/da6f4dmql/image/upload/v1765533012/Ho%CC%82%CC%80_so%CC%9B_na%CC%86ng_lu%CC%9B%CC%A3c_Gennovax_5_1_1_sk1rbx.png",
  title: "Phòng Lab Chuẩn Quốc Tế",
  description:
    "Hệ thống phòng Lab được trang bị máy móc hiện đại, tự động và tuân thủ nghiêm ngặt các tiêu chuẩn kiểm soát chất lượng quốc tế.",
  stats: [
    { icon: CheckSquare, text: "Chứng chỉ ISO 15189 (Wet-lab & Dry-lab)" },
    { icon: CheckSquare, text: "Sử dụng Kit chuẩn IVD (Bộ Y Tế cấp phép)" },
    { icon: Cpu, text: "Hệ thống giải trình tự gen (ABI, Illumina, MGI)" },
    { icon: Cpu, text: "Hệ thống Real-time PCR (Biorad, Thermo Fisher)" },
  ],
};

// Màu sắc
const brandColors = {
  primary: "#0D47A1",
  secondary: "#0891B2",
};

// --- COMPONENT CHÍNH ---

export default function PartnersAndEquipment() {
  return (
    <section
      id="doi-tac-va-thuyet-bi"
      className="w-full bg-white py-24" // Nền trắng
    >
      <div className="container mx-auto max-w-7xl px-4">
        {/* Tiêu đề Section */}
        <h2
          className="mb-20 text-center text-4xl font-extrabold"
          style={{ color: brandColors.primary }}
        >
          Đối Tác & Nền Tảng Công Nghệ
        </h2>

        {/* Container cho các khối "so le" */}
        <div className="space-y-20">
          {/* === KHỐI 1: ĐỐI TÁC (Ảnh trái, Text phải) === */}
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            {/* Cột Ảnh 1 */}
            <div>
              <img
                src={partnersData.image}
                alt={partnersData.title}
                className="h-auto w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
            {/* Cột Nội dung 1 */}
            <div className="rounded-xl bg-gray-50 p-8 shadow-lg">
              <h3
                className="mb-4 text-3xl font-bold"
                style={{ color: brandColors.primary }}
              >
                {partnersData.title}
              </h3>
              <p className="mb-6 text-lg text-gray-700">
                {partnersData.description}
              </p>
              <ul className="space-y-4">
                {partnersData.stats.map((stat, index) => (
                  <li key={index} className="flex items-start text-lg">
                    <stat.icon
                      className="mr-3 mt-1 h-6 w-6 flex-shrink-0"
                      style={{ color: brandColors.secondary }}
                    />
                    <span className="text-gray-700">{stat.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* === KHỐI 2: THIẾT BỊ & CHUẨN (Text trái, Ảnh phải) === */}
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            {/* Cột Nội dung 2 (order-last để nằm bên trái) */}
            <div className="order-last rounded-xl bg-gray-50 p-8 shadow-lg md:order-first">
              <h3
                className="mb-4 text-3xl font-bold"
                style={{ color: brandColors.primary }}
              >
                {equipmentData.title}
              </h3>
              <p className="mb-6 text-lg text-gray-700">
                {equipmentData.description}
              </p>
              <ul className="space-y-4">
                {equipmentData.stats.map((stat, index) => (
                  <li key={index} className="flex items-start text-lg">
                    <stat.icon
                      className="mr-3 mt-1 h-6 w-6 flex-shrink-0"
                      style={{ color: brandColors.secondary }}
                    />
                    <span className="text-gray-700">{stat.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Cột Ảnh 2 */}
            <div className="order-first md:order-last">
              <img
                src={equipmentData.image}
                alt={equipmentData.title}
                className="h-auto w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
