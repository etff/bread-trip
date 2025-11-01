import Link from "next/link";
import { MapPin, Croissant } from "lucide-react";
import type { Bakery } from "@/types/common";

interface BakeryListProps {
  bakeries: Bakery[];
}

export default function BakeryList({ bakeries }: BakeryListProps) {
  if (bakeries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
        <div className="text-6xl mb-4">🍞</div>
        <h3 className="text-xl font-bold text-brown mb-2">
          아직 등록된 빵집이 없습니다
        </h3>
        <p className="text-gray-600 font-medium">
          첫 번째로 빵집을 등록해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {bakeries.map((bakery) => (
        <Link
          key={bakery.id}
          href={`/bakeries/${bakery.id}`}
          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="flex gap-4 p-4">
            {/* 이미지 */}
            <div className="w-24 h-24 flex-shrink-0 bg-cream rounded-lg overflow-hidden">
              {bakery.image_url ? (
                <img
                  src={bakery.image_url}
                  alt={bakery.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🍞
                </div>
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-brown mb-1 truncate">
                {bakery.name}
              </h3>

              {/* 지역 */}
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {bakery.district || "서울"}
                </span>
              </div>

              {/* 대표 메뉴 */}
              {bakery.signature_bread && (
                <div className="flex items-center text-gray-500 text-sm">
                  <Croissant className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{bakery.signature_bread}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
