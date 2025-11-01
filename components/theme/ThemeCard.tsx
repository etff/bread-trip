import Link from "next/link";
import type { Theme } from "@/types/common";

interface ThemeCardProps {
  theme: Theme;
  bakeryCount?: number;
}

export default function ThemeCard({ theme, bakeryCount }: ThemeCardProps) {
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

  return (
    <Link
      href={`/themes/${theme.id}`}
      className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
      style={{
        borderLeft: `4px solid ${theme.color || "#8B4513"}`,
      }}
    >
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div
          className="text-5xl flex-shrink-0"
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          }}
        >
          {theme.icon || "🍞"}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          {/* 카테고리 뱃지 */}
          <div className="mb-2">
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

          {/* 테마 이름 */}
          <h3 className="text-xl font-bold text-brown mb-2">{theme.name}</h3>

          {/* 설명 */}
          {theme.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {theme.description}
            </p>
          )}

          {/* 빵집 수 */}
          {bakeryCount !== undefined && (
            <p className="text-sm font-semibold text-gray-500">
              {bakeryCount}개의 빵집
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
