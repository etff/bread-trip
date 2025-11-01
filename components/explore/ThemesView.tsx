"use client";

import { useEffect, useState } from "react";
import HeroBanner from "./HeroBanner";
import TopRatedSection from "./TopRatedSection";
import ThemeSection from "./ThemeSection";
import ThemeCard from "@/components/theme/ThemeCard";
import type { BakeryWithRating, Theme, ThemeWithBakeries } from "@/types/common";

interface ThemesViewProps {
  initialThemes: Theme[];
}

export default function ThemesView({ initialThemes }: ThemesViewProps) {
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

      // 각 테마별 빵집 가져오기 (처음 5개만)
      const themePromises = initialThemes.slice(0, 5).map(async (theme) => {
        const response = await fetch(`/api/themes/${theme.id}`);
        const data = await response.json();
        return data.theme;
      });

      const themesData = await Promise.all(themePromises);
      setThemesWithBakeries(themesData.filter((t) => t && t.bakeries && t.bakeries.length > 0));
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "bread_type":
        return "빵 종류별";
      case "atmosphere":
        return "분위기별";
      case "special":
        return "특별한 빵집";
      default:
        return category;
    }
  };

  const groupedThemes = initialThemes.reduce(
    (acc, theme) => {
      if (!acc[theme.category]) {
        acc[theme.category] = [];
      }
      acc[theme.category].push(theme);
      return acc;
    },
    {} as Record<string, Theme[]>
  );

  if (isLoading) {
    return (
      <div className="min-h-full bg-warm flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🍞</div>
          <p className="text-brown font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-warm pb-20">
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {/* 히어로 배너 */}
        <HeroBanner />

        {/* 평점 높은 빵집 */}
        {topRatedBakeries.length > 0 && (
          <TopRatedSection bakeries={topRatedBakeries} />
        )}

        {/* 테마별 빵집 추천 섹션 */}
        {themesWithBakeries.map((theme) => (
          <ThemeSection
            key={theme.id}
            theme={theme}
            bakeries={theme.bakeries || []}
          />
        ))}

        {/* 전체 테마 목록 */}
        {initialThemes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center mt-8">
            <div className="text-6xl mb-4">🍞</div>
            <h2 className="text-xl font-bold mb-2">아직 테마가 없습니다</h2>
            <p className="text-gray-700 font-medium">
              곧 다양한 테마가 추가될 예정입니다!
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-brown mb-6">모든 테마 둘러보기</h2>
            {/* 테마 카테고리별 섹션 */}
            <div className="space-y-10">
              {Object.entries(groupedThemes).map(([category, categoryThemes]) => (
                <section key={category}>
                  {/* 카테고리 제목 */}
                  <h3 className="text-xl font-bold text-brown mb-4">
                    {getCategoryLabel(category)}
                  </h3>

                  {/* 테마 그리드 */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryThemes.map((theme) => (
                      <ThemeCard key={theme.id} theme={theme} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
