import { Star, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReviewWithUser, ReviewWithBakery } from "@/types/common";

interface ReviewCardProps {
  review: ReviewWithUser & Partial<ReviewWithBakery>;
  showBakery?: boolean;
}

export default function ReviewCard({
  review,
  showBakery = true,
}: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "오늘";
    if (days === 1) return "어제";
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    if (days < 365) return `${Math.floor(days / 30)}개월 전`;
    return `${Math.floor(days / 365)}년 전`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      {/* 빵집 정보 (showBakery가 true일 때만) */}
      {showBakery && review.bakery && (
        <Link
          href={`/bakeries/${review.bakery.id}`}
          className="flex items-center gap-3 mb-4 pb-4 border-b border-cream hover:opacity-80 transition-opacity"
        >
          {review.bakery.image_url ? (
            <img
              src={review.bakery.image_url}
              alt={review.bakery.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-cream flex items-center justify-center">
              <span className="text-2xl">🍞</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-brown truncate">
              {review.bakery.name}
            </h3>
            <p className="text-xs text-gray-700 font-medium">
              <MapPin className="w-3 h-3 inline mr-1" />
              빵집 상세 보기
            </p>
          </div>
        </Link>
      )}

      {/* 사용자 정보 & 평점 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-sm">
            {review.user?.profile_image_url ? (
              <img
                src={review.user.profile_image_url}
                alt={review.user.nickname || "사용자"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              "🍞"
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {review.user?.nickname || "익명"}
            </p>
            <p className="text-xs text-gray-700 font-medium">
              {formatDate(review.created_at)}
            </p>
          </div>
        </div>

        {/* 별점 */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 리뷰 내용 */}
      {review.comment && (
        <p className="text-gray-900 text-sm leading-relaxed font-medium">
          {review.comment}
        </p>
      )}

      {/* 리뷰 사진 */}
      {review.photo_url && (
        <div className="mt-3">
          <img
            src={review.photo_url}
            alt="리뷰 사진"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
