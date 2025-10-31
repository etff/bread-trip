"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Croissant, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import ReviewModal from "@/components/review/ReviewModal";
import ReviewCard from "@/components/review/ReviewCard";
import type { Bakery, ReviewWithUser } from "@/types/common";

export default function BakeryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bakery, setBakery] = useState<Bakery | null>(null);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBakery(params.id as string);
      fetchReviews(params.id as string);
    }
  }, [params.id]);

  const fetchBakery = async (id: string) => {
    try {
      const response = await fetch(`/api/bakeries/${id}`);
      const data = await response.json();

      if (data.bakery) {
        setBakery(data.bakery);
      }
    } catch (error) {
      console.error("빵집 정보 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async (bakeryId: string) => {
    try {
      const response = await fetch(`/api/reviews?bakeryId=${bakeryId}`);
      const data = await response.json();

      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("리뷰 로드 실패:", error);
    }
  };

  const handleToggleFavorite = () => {
    // TODO: 찜하기 API 호출
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🍞</div>
          <p className="text-brown font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!bakery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm">
        <div className="text-center">
          <div className="text-4xl mb-2">😢</div>
          <p className="text-brown font-medium mb-4">빵집을 찾을 수 없습니다</p>
          <Button onClick={() => router.push("/")}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-cream">
        <div className="max-w-screen-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-cream rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-brown" />
          </button>
          <h1 className="text-lg font-bold text-brown truncate flex-1 mx-4">
            {bakery.name}
          </h1>
          <button
            onClick={handleToggleFavorite}
            className="p-2 hover:bg-cream rounded-lg transition-colors"
          >
            <Heart
              className={`w-6 h-6 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="max-w-screen-md mx-auto">
        {/* 이미지 */}
        {bakery.image_url ? (
          <div className="w-full h-64 bg-cream overflow-hidden">
            <img
              src={bakery.image_url}
              alt={bakery.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-64 bg-cream flex items-center justify-center">
            <span className="text-8xl">🍞</span>
          </div>
        )}

        {/* 정보 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div>
            <h2 className="text-3xl font-bold text-brown mb-2">
              {bakery.name}
            </h2>
            {bakery.district && (
              <p className="text-gray-700 font-semibold">📍 {bakery.district}</p>
            )}
          </div>

          {/* 소개 */}
          {bakery.description && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-gray-700 leading-relaxed">{bakery.description}</p>
            </div>
          )}

          {/* 상세 정보 카드 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            {bakery.signature_bread && (
              <div className="flex items-start gap-3">
                <Croissant className="w-6 h-6 text-brown mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 font-semibold mb-1">대표 메뉴</p>
                  <p className="font-bold text-lg text-gray-900">{bakery.signature_bread}</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-brown mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 font-semibold mb-1">주소</p>
                  <p className="font-semibold text-gray-900">{bakery.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 리뷰 섹션 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-lg">
                리뷰 {reviews.length > 0 && `(${reviews.length})`}
              </h3>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    showBakery={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-700 font-medium">
                아직 리뷰가 없습니다
                <br />
                <span className="text-sm font-medium">첫 번째 리뷰를 남겨보세요!</span>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="grid grid-cols-2 gap-3 pb-6">
            <Button
              variant="secondary"
              onClick={() => {
                window.open(
                  `https://map.kakao.com/link/to/${bakery.name},${bakery.lat},${bakery.lng}`,
                  "_blank"
                );
              }}
            >
              길찾기
            </Button>
            <Button onClick={() => setIsReviewModalOpen(true)}>
              리뷰 작성
            </Button>
          </div>
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {bakery && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          bakery={bakery}
          onSuccess={() => {
            fetchReviews(bakery.id);
          }}
        />
      )}
    </div>
  );
}
