import Link from "next/link";
import { MapPin, Croissant } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import type { BakeryWithRating } from "@/types/common";

interface BakeryCardProps {
  bakery: BakeryWithRating;
}

export default function BakeryCard({ bakery }: BakeryCardProps) {
  return (
    <Link
      href={`/bakeries/${bakery.id}`}
      className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
    >
      {/* 이미지 */}
      <div className="w-full aspect-[4/3] bg-cream overflow-hidden">
        {bakery.image_url ? (
          <img
            src={bakery.image_url}
            alt={bakery.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍞
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4">
        {/* 평점 */}
        {bakery.average_rating !== undefined && bakery.average_rating > 0 && (
          <div className="mb-2">
            <StarRating
              rating={bakery.average_rating}
              reviewCount={bakery.review_count}
              size="sm"
            />
          </div>
        )}

        {/* 빵집 이름 */}
        <h3 className="text-lg font-bold text-brown mb-1 line-clamp-1">
          {bakery.name}
        </h3>

        {/* 지역 */}
        <div className="flex items-center text-gray-600 text-sm mb-1">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{bakery.district || "서울"}</span>
        </div>

        {/* 대표 메뉴 */}
        {bakery.signature_bread && (
          <div className="flex items-center text-gray-500 text-sm">
            <Croissant className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{bakery.signature_bread}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
