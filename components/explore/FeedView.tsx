"use client";

import { useEffect, useState } from "react";
import HeroBanner from "./HeroBanner";
import TopRatedSection from "./TopRatedSection";
import ThemeSection from "./ThemeSection";
import type { BakeryWithRating, Theme, ThemeWithBakeries } from "@/types/common";

interface FeedViewProps {
  initialThemes: Theme[];
}

export default function FeedView({ initialThemes }: FeedViewProps) {
  const [topRatedBakeries, setTopRatedBakeries] = useState<BakeryWithRating[]>([]);
  const [themesWithBakeries, setThemesWithBakeries] = useState<ThemeWithBakeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    try {
      // 평점 높은 빵집 가져오기
      const topRatedResponse = await fetch("/api/bakeries?sort=rating&limit=10");
      const topRatedData = await topRatedResponse.json();

      if (topRatedData.bakeries) {
        // 평점 4.0 이상만 필터링
        const filtered = topRatedData.bakeries.filter(
          (b: BakeryWithRating) => b.average_rating && b.average_rating >= 4.0
        );
        setTopRatedBakeries(filtered);
      }

      // 각 테마별 빵집 가져오기
      const themePromises = initialThemes.map(async (theme) => {
        const response = await fetch(`/api/themes/${theme.id}`);
        const data = await response.json();
        return data.theme;
      });

      const themesData = await Promise.all(themePromises);
      setThemesWithBakeries(themesData.filter((t) => t && t.bakeries && t.bakeries.length > 0));
    } catch (error) {
      console.error("피드 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🍞</div>
          <p className="text-brown font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm pb-24">
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {/* 히어로 배너 */}
        <HeroBanner />

        {/* 평점 높은 빵집 */}
        <TopRatedSection bakeries={topRatedBakeries} />

        {/* 테마별 섹션 */}
        {themesWithBakeries.map((theme) => (
          <ThemeSection
            key={theme.id}
            theme={theme}
            bakeries={theme.bakeries || []}
          />
        ))}
      </div>
    </div>
  );
}
