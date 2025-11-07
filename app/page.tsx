"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Map, Grid } from "lucide-react";
import MapView from "@/components/explore/MapView";
import ThemesView from "@/components/explore/ThemesView";
import type { BakeryWithRating, Theme } from "@/types/common";

type TabType = "map" | "themes";

function HomeContent() {
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challenge");
  const [activeTab, setActiveTab] = useState<TabType>("themes");
  const [bakeries, setBakeries] = useState<BakeryWithRating[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // 챌린지 ID가 있으면 지도 탭으로 전환
    if (challengeId) {
      setActiveTab("map");
    }
  }, [challengeId]);

  const fetchInitialData = async () => {
    try {
      // 빵집 데이터 로드
      const bakeriesResponse = await fetch("/api/bakeries");
      const bakeriesData = await bakeriesResponse.json();

      if (bakeriesData.bakeries) {
        setBakeries(bakeriesData.bakeries);
      }

      // 테마 데이터 로드
      const themesResponse = await fetch("/api/themes");
      const themesData = await themesResponse.json();

      if (themesData.themes) {
        setThemes(themesData.themes);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
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
    <div className="h-screen w-full flex flex-col">
      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-cream sticky top-0 z-50">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab("themes")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-colors ${
                activeTab === "themes"
                  ? "text-brown border-b-2 border-brown"
                  : "text-gray-500 hover:text-brown"
              }`}
            >
              <Grid className="w-5 h-5" />
              <span>테마</span>
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-colors ${
                activeTab === "map"
                  ? "text-brown border-b-2 border-brown"
                  : "text-gray-500 hover:text-brown"
              }`}
            >
              <Map className="w-5 h-5" />
              <span>지도</span>
            </button>
          </div>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "map" ? (
          <MapView
            initialBakeries={bakeries}
            initialThemes={themes}
            challengeId={challengeId || undefined}
          />
        ) : (
          <div className="h-full overflow-y-auto">
            <ThemesView initialThemes={themes} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-cream">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-bounce">🍞</div>
            <p className="text-brown font-medium">빵집을 찾는 중...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
