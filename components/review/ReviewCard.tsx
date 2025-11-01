import { Star, MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ReviewWithUser, ReviewWithBakery } from "@/types/common";

interface ReviewCardProps {
  review: ReviewWithUser & Partial<ReviewWithBakery>;
  showBakery?: boolean;
  currentUserId?: string; // 현재 로그인한 사용자 ID
  onEdit?: () => void; // 수정 버튼 클릭 핸들러
  onDelete?: () => void; // 삭제 버튼 클릭 핸들러
}

export default function ReviewCard({
  review,
  showBakery = true,
  currentUserId,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // 본인 리뷰인지 확인
  const isOwnReview = currentUserId && review.user_id === currentUserId;
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
          <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-sm overflow-hidden">
            {review.user?.profile_image_url ? (
              <img
                src={review.user.profile_image_url}
                alt={review.user.nickname || "사용자"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <img
                src="/mascot.png"
                alt="빵지순례 마스코트"
                className="w-6 h-6 object-contain"
              />
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

        <div className="flex items-center gap-2">
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

          {/* 수정/삭제 메뉴 (본인 리뷰일 때만 표시) */}
          {isOwnReview && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>

              {showMenu && (
                <>
                  {/* 배경 클릭 시 메뉴 닫기 */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />

                  {/* 드롭다운 메뉴 */}
                  <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit?.();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>수정</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete?.();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>삭제</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
