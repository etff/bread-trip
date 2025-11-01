"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BakeryList from "@/components/theme/BakeryList";
import type { ThemeWithBakeries } from "@/types/common";

export default function ThemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeWithBakeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTheme(params.id as string);
    }
  }, [params.id]);

  const fetchTheme = async (id: string) => {
    try {
      const response = await fetch(`/api/themes/${id}`);
      const data = await response.json();

      if (data.theme) {
        setTheme(data.theme);
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
        return "빵 종류";
      case "atmosphere":
        return "분위기";
      case "special":
        return "특별한";
      default:
        return category;
    }
  };

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

  if (!theme) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-brown mb-4">
            테마를 찾을 수 없습니다
          </h2>
          <button
            onClick={() => router.push("/themes")}
            className="px-6 py-3 bg-brown text-white rounded-lg hover:bg-brown/90 transition-colors font-medium"
          >
            테마 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-cream">
        <div className="max-w-screen-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-cream rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-brown" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-brown truncate">
                {theme.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 py-8">
        {/* 테마 정보 카드 */}
        <div
          className="bg-white rounded-2xl p-6 mb-8 shadow-sm"
          style={{
            borderLeft: `4px solid ${theme.color || "#8B4513"}`,
          }}
        >
          <div className="flex items-start gap-4">
            {/* 아이콘 */}
            <div
              className="text-6xl flex-shrink-0"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            >
              {theme.icon || "🍞"}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              {/* 카테고리 뱃지 */}
              <div className="mb-3">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: theme.color
                      ? `${theme.color}20`
                      : "#f5e6d3",
                    color: theme.color || "#8B4513",
                  }}
                >
                  {getCategoryLabel(theme.category)}
                </span>
              </div>

              {/* 설명 */}
              {theme.description && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {theme.description}
                </p>
              )}

              {/* 빵집 수 */}
              <p className="text-sm font-bold text-gray-600">
                {theme.bakery_count || theme.bakeries?.length || 0}개의 빵집
              </p>
            </div>
          </div>
        </div>

        {/* 빵집 목록 */}
        <div>
          <h2 className="text-2xl font-bold text-brown mb-4">빵집 목록</h2>
          <BakeryList bakeries={theme.bakeries || []} />
        </div>
      </div>
    </div>
  );
}
