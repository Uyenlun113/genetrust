"use client";

import React from "react";
// import Image from 'next/image'; // Nên dùng 'next/image' khi deploy
import {
  Users,
  Network,
  BarChart,
  Cpu,
  MapPin,
  CheckCircle,
  Clock,
  Star,
  ClipboardList,
  Dna,
  TestTube,
  Bug,
} from "lucide-react";

// --- DỮ LIỆU TỔNG HỢP ---

// 1. Năng Lực Cốt Lõi
const capacityData = {
  image:
    "/images/gioithieu-hethongGennovax/anh1.jpg",
  title: "Năng Lực Cốt Lõi",
  description:
    "Genetrust xây dựng nền tảng vững chắc từ nhân sự chuyên môn cao đến hệ thống trang thiết bị hiện đại, đảm bảo năng lực xử lý khối lượng mẫu lớn mỗi ngày.",
  stats: [
    { icon: Users, number: "70+", text: "Nhân sự chuyên môn" },
    { icon: Network, number: "20+", text: "Phòng LAB hợp tác Toàn quốc" },
    { icon: BarChart, number: "1000+", text: "Mẫu xét nghiệm hàng ngày" },
    { icon: Cpu, number: "100+", text: "Danh mục thiết bị hiện đại" },
  ],
};

// 2. Mạng Lưới & Dịch Vụ
const networkData = {
  image:
    "https://res.cloudinary.com/da6f4dmql/image/upload/v1765532565/Ho%CC%82%CC%80_so%CC%9B_na%CC%86ng_lu%CC%9B%CC%A3c_Gennovax_8_1_1_xr5vnb.png",
  title: "Phát Triển & Cam Kết Dịch Vụ",
  description:
    "Với mạng lưới nhân sự, ctv thu mẫu toàn quốc và quy trình tối ưu, chúng tôi cam kết mang đến dịch vụ 5 sao: Chuẩn xác - Nhanh - Chuyên nghiệp - Linh hoạt.",
  stats: [
    { icon: MapPin, text: "Lấy mẫu toàn quốc" },
    { icon: Star, text: "Cam kết dịch vụ chuẩn 5 sao" },
    {
      icon: Clock,
      text: "Nhận mẫu siêu tốc (Nội thành < 1h, Ngoại thành < 3h)",
    },
    {
      icon: CheckCircle,
      text: "Trả kết quả nhanh nhất (Khách Key < 6h, Thường < 72h)",
    },
  ],
};

// 3. Hệ Thống Xét Nghiệm
const servicesData = {
  image:
    "/images/gioithieu-hethongGennovax/anh3.png",
  title: "Hệ Thống Xét Nghiệm Đa Dạng",
  description:
    "Chúng tôi cung cấp một hệ sinh thái xét nghiệm gen toàn diện, đáp ứng mọi nhu cầu sàng lọc và chẩn đoán y học chính xác.",
  stats: [
    { icon: Dna, text: "Sàng lọc trước sinh (NIPT)" },
    { icon: Dna, text: "Di truyền tiền làm tổ (PGT)" },
    { icon: Dna, text: "ADN huyết thống" },
    { icon: TestTube, text: "Vi sinh phân tử & Xét nghiệm sinh hoá" },
    { icon: Bug, text: "Sàng lọc ung thư và bệnh lý di truyền" },
  ],
};

// Màu sắc
const brandColors = {
  primary: "#0D47A1",
  secondary: "#0891B2",
};

// --- COMPONENT CHÍNH ---

export default function GenetrustSystem() {
  return (
    <section
      id="he-thong-genetrust"
      className="w-full bg-white py-24" // Nền trắng
    >
      <div className="container mx-auto max-w-7xl px-4">
        {/* Tiêu đề Section */}
        <h2
          className="mb-20 text-center text-4xl font-extrabold"
          style={{ color: brandColors.primary }}
        >
          Hệ Thống Genetrust Toàn Diện
        </h2>

        {/* Container cho các khối "so le" */}
        <div className="space-y-20">
          {/* === KHỐI 1: NĂNG LỰC CỐT LÕI (Ảnh trái, Text phải) === */}
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            {/* Cột Ảnh 1 */}
            <div>
              <img
                src={capacityData.image}
                alt={capacityData.title}
                className="h-auto w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
            {/* Cột Nội dung 1 */}
            <div className="rounded-xl bg-gray-50 p-8 shadow-lg">
              <h3
                className="mb-4 text-3xl font-bold"
                style={{ color: brandColors.primary }}
              >
                {capacityData.title}
              </h3>
              <p className="mb-6 text-lg text-gray-700">
                {capacityData.description}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {capacityData.stats.map((stat) => (
                  <div key={stat.text} className="flex items-start">
                    <stat.icon
                      className="mr-3 mt-1 h-6 w-6 flex-shrink-0"
                      style={{ color: brandColors.secondary }}
                    />
                    <div>
                      <span className="block text-2xl font-bold text-gray-800">
                        {stat.number}
                      </span>
                      <span className="text-sm text-gray-600">{stat.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === KHỐI 2: MẠNG LƯỚI & DỊCH VỤ (Text trái, Ảnh phải) === */}
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            {/* Cột Nội dung 2 (order-last để nằm bên trái trên desktop) */}
            <div className="order-last rounded-xl bg-gray-50 p-8 shadow-lg md:order-first">
              <h3
                className="mb-4 text-3xl font-bold"
                style={{ color: brandColors.primary }}
              >
                {networkData.title}
              </h3>
              <p className="mb-6 text-lg text-gray-700">
                {networkData.description}
              </p>
              <ul className="space-y-4">
                {networkData.stats.map((stat) => (
                  <li key={stat.text} className="flex items-start text-lg">
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
                src={networkData.image}
                alt={networkData.title}
                className="h-auto w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
          </div>

          {/* === KHỐI 3: HỆ THỐNG XÉT NGHIỆM (Ảnh trái, Text phải) === */}
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            {/* Cột Ảnh 3 */}
            <div>
              <img
                src={servicesData.image}
                alt={servicesData.title}
                className="h-auto w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
            {/* Cột Nội dung 3 */}
            <div className="rounded-xl bg-gray-50 p-8 shadow-lg">
              <h3
                className="mb-4 text-3xl font-bold"
                style={{ color: brandColors.primary }}
              >
                {servicesData.title}
              </h3>
              <p className="mb-6 text-lg text-gray-700">
                {servicesData.description}
              </p>
              <ul className="space-y-4">
                {servicesData.stats.map((stat) => (
                  <li key={stat.text} className="flex items-start text-lg">
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
        </div>
      </div>
    </section>
  );
}
