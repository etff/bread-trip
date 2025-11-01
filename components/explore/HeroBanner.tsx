"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  backgroundColor?: string;
}

const BANNERS: Banner[] = [
  {
    id: "1",
    title: "이달의 크루아상 맛집",
    description: "바삭한 크루아상을 찾아서",
    imageUrl: "/images/banner-croissant.jpg",
    linkUrl: "/themes",
    backgroundColor: "#f5e6d3",
  },
  {
    id: "2",
    title: "평점 4.5 이상 인기 빵집",
    description: "검증된 맛집만 모았어요",
    imageUrl: "/images/banner-popular.jpg",
    linkUrl: "/themes",
    backgroundColor: "#ffe4e1",
  },
  {
    id: "3",
    title: "비건 베이커리 특집",
    description: "건강한 빵을 만나보세요",
    imageUrl: "/images/banner-vegan.jpg",
    linkUrl: "/themes",
    backgroundColor: "#e8f5e9",
  },
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 4000); // 4초마다 자동 전환

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentBanner = BANNERS[currentIndex];

  return (
    <div className="relative w-full mb-6">
      {/* 배너 */}
      <Link href={currentBanner.linkUrl} className="block">
        <div
          className="relative w-full h-48 rounded-2xl overflow-hidden shadow-md"
          style={{ backgroundColor: currentBanner.backgroundColor }}
        >
          {/* 배경 이미지 (옵션) */}
          {currentBanner.imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          )}

          {/* 텍스트 */}
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <h2 className="text-2xl font-bold text-brown mb-2">
              {currentBanner.title}
            </h2>
            <p className="text-gray-700 font-medium">
              {currentBanner.description}
            </p>
          </div>
        </div>
      </Link>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-2 mt-4">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-brown"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`배너 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}
