"use client";

import { useEffect, useState } from "react";
import ThemeCard from "@/components/theme/ThemeCard";
import type { Theme } from "@/types/common";

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch("/api/themes");
      const data = await response.json();

      if (data.themes) {
        setThemes(data.themes);
      }
    } catch (error) {
      console.error("테마 로드 실패:", error);
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

  const groupedThemes = themes.reduce(
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
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🍞</div>
          <p className="text-brown font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm pb-20">
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brown mb-2">테마별 빵집</h1>
          <p className="text-gray-700 font-medium">
            원하는 테마의 빵집을 찾아보세요!
          </p>
        </div>

        {/* 테마 없음 */}
        {themes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <div className="text-6xl mb-4">🍞</div>
            <h2 className="text-xl font-bold mb-2">아직 테마가 없습니다</h2>
            <p className="text-gray-700 font-medium">
              곧 다양한 테마가 추가될 예정입니다!
            </p>
          </div>
        ) : (
          /* 테마 카테고리별 섹션 */
          <div className="space-y-10">
            {Object.entries(groupedThemes).map(([category, categoryThemes]) => (
              <section key={category}>
                {/* 카테고리 제목 */}
                <h2 className="text-2xl font-bold text-brown mb-4">
                  {getCategoryLabel(category)}
                </h2>

                {/* 테마 그리드 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryThemes.map((theme) => (
                    <ThemeCard key={theme.id} theme={theme} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
