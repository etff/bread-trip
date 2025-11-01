import BakeryCard from "./BakeryCard";
import type { BakeryWithRating } from "@/types/common";

interface TopRatedSectionProps {
  bakeries: BakeryWithRating[];
}

export default function TopRatedSection({ bakeries }: TopRatedSectionProps) {
  if (bakeries.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-brown flex items-center gap-2">
          <span>⭐</span>
          <span>별점이 높은 빵집</span>
        </h2>
      </div>

      {/* 가로 스크롤 리스트 */}
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4" style={{ width: "max-content" }}>
          {bakeries.map((bakery) => (
            <div key={bakery.id} className="w-64 flex-shrink-0">
              <BakeryCard bakery={bakery} />
            </div>
          ))}
        </div>
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
    </section>
  );
}
