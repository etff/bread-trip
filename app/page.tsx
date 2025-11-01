"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import KakaoMap from "@/components/map/KakaoMap";
import BottomSheet from "@/components/map/BottomSheet";
import ThemeFilter from "@/components/map/ThemeFilter";
import AuthModal from "@/components/layout/AuthModal";
import { getUser } from "@/app/actions/auth";
import type { Bakery, BakeryWithRating, Theme } from "@/types/common";

export default function Home() {
  const router = useRouter();
  const [bakeries, setBakeries] = useState<BakeryWithRating[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [selectedBakery, setSelectedBakery] = useState<BakeryWithRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchThemes();
    fetchBakeries();
  }, []);

  useEffect(() => {
    fetchBakeries();
  }, [selectedThemeId]);

  const fetchThemes = async () => {
    try {
      const response = await fetch("/api/themes");
      const data = await response.json();

      if (data.themes) {
        setThemes(data.themes);
      }
    } catch (error) {
      console.error("테마 데이터 로드 실패:", error);
    }
  };

  const fetchBakeries = async () => {
    try {
      const url = selectedThemeId
        ? `/api/bakeries?theme=${selectedThemeId}`
        : "/api/bakeries";
      const response = await fetch(url);
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

  const handleAddBakeryClick = async () => {
    const user = await getUser();
    if (user) {
      router.push("/bakeries/new");
    } else {
      setIsAuthModalOpen(true);
    }
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
    <div className="fixed inset-0 w-full h-full">
      {/* 지도 */}
      <div className="absolute inset-0">
        <KakaoMap
          bakeries={bakeries}
          onMarkerClick={handleMarkerClick}
          center={{ lat: 37.5665, lng: 126.9780 }}
          level={7}
        />
      </div>

      {/* 상단 배너 */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg mb-3">
          <h1 className="text-xl font-bold text-brown mb-1">빵지순례 🍞</h1>
          <p className="text-sm text-gray-600">
            {selectedThemeId
              ? `${bakeries.length}개의 테마별 빵집`
              : `서울에 있는 ${bakeries.length}개의 빵집을 탐험해보세요`}
          </p>
        </div>

        {/* 테마 필터 */}
        {themes.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl py-3 shadow-lg">
            <ThemeFilter
              themes={themes}
              selectedThemeId={selectedThemeId}
              onSelectTheme={setSelectedThemeId}
            />
          </div>
        )}
      </div>

      {/* 하단 시트 */}
      <BottomSheet
        bakery={selectedBakery}
        onClose={() => setSelectedBakery(null)}
        onViewDetail={handleViewDetail}
      />

      {/* FAB - 빵집 등록 버튼 */}
      <button
        onClick={handleAddBakeryClick}
        className="fixed right-4 bottom-24 z-[60] w-14 h-14 bg-brown text-white rounded-full shadow-lg hover:bg-brown/90 transition-all hover:scale-110 flex items-center justify-center active:scale-95 cursor-pointer"
        aria-label="빵집 등록"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 로그인 모달 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
