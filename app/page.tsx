"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KakaoMap from "@/components/map/KakaoMap";
import BottomSheet from "@/components/map/BottomSheet";
import type { Bakery } from "@/types/common";

export default function Home() {
  const router = useRouter();
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [selectedBakery, setSelectedBakery] = useState<Bakery | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBakeries();
  }, []);

  const fetchBakeries = async () => {
    try {
      const response = await fetch("/api/bakeries");
      const data = await response.json();

      if (data.bakeries) {
        setBakeries(data.bakeries);
      }
    } catch (error) {
      console.error("빵집 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerClick = (bakery: Bakery) => {
    setSelectedBakery(bakery);
  };

  const handleViewDetail = (bakery: Bakery) => {
    router.push(`/bakeries/${bakery.id}`);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🍞</div>
          <p className="text-brown font-medium">빵집을 찾는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      {/* 지도 */}
      <KakaoMap
        bakeries={bakeries}
        onMarkerClick={handleMarkerClick}
        center={{ lat: 37.5665, lng: 126.9780 }}
        level={7}
      />

      {/* 상단 배너 */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
          <h1 className="text-xl font-bold text-brown mb-1">빵지순례 🍞</h1>
          <p className="text-sm text-gray-600">
            서울에 있는 {bakeries.length}개의 빵집을 탐험해보세요
          </p>
        </div>
      </div>

      {/* 하단 시트 */}
      <BottomSheet
        bakery={selectedBakery}
        onClose={() => setSelectedBakery(null)}
        onViewDetail={handleViewDetail}
      />
    </div>
  );
}
