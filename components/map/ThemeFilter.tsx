import type { Theme } from "@/types/common";

interface ThemeFilterProps {
  themes: Theme[];
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string | null) => void;
}

export default function ThemeFilter({
  themes,
  selectedThemeId,
  onSelectTheme,
}: ThemeFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2 px-4">
        {/* 전체 버튼 */}
        <button
          onClick={() => onSelectTheme(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            selectedThemeId === null
              ? "bg-brown text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          전체
        </button>

        {/* 테마 버튼들 */}
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme.id)}
            className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedThemeId === theme.id
                ? "shadow-md"
                : "bg-white hover:scale-105"
            }`}
            style={
              selectedThemeId === theme.id
                ? {
                    backgroundColor: theme.color || "#8B4513",
                    color: "white",
                  }
                : {
                    backgroundColor: "white",
                    color: theme.color || "#8B4513",
                  }
            }
          >
            <span>{theme.icon || "🍞"}</span>
            <span>{theme.name}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
