import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BakeryCard from "./BakeryCard";
import type { Theme, BakeryWithRating } from "@/types/common";

interface ThemeSectionProps {
  theme: Theme;
  bakeries: BakeryWithRating[];
}

export default function ThemeSection({ theme, bakeries }: ThemeSectionProps) {
  if (bakeries.length === 0) {
    return null;
  }

  // 최대 6개까지만 표시
  const displayBakeries = bakeries.slice(0, 6);

  return (
    <section className="mb-10">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-brown flex items-center gap-2">
          <span>{theme.icon || "🍞"}</span>
          <span>{theme.name}</span>
        </h2>
        <Link
          href={`/themes/${theme.id}`}
          className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-brown transition-colors"
        >
          <span>더보기</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2열 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {displayBakeries.map((bakery) => (
          <BakeryCard key={bakery.id} bakery={bakery} />
        ))}
      </div>
    </section>
  );
}
