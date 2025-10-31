"use client";

import { useEffect, useState } from "react";
import ReviewCard from "@/components/review/ReviewCard";
import type { ReviewWithUser, ReviewWithBakery } from "@/types/common";

export default function FeedPage() {
  const [reviews, setReviews] = useState<
    (ReviewWithUser & ReviewWithBakery)[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();

      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("리뷰 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-screen-md mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brown">피드</h1>
          <p className="text-gray-700 text-sm mt-1 font-medium">
            다른 빵집의 리뷰를 확인해보세요!
          </p>
        </div>

        {/* 로딩 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce">🍞</div>
              <p className="text-brown font-medium">로딩 중...</p>
            </div>
          </div>
        ) : reviews.length > 0 ? (
          /* 리뷰 리스트 */
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} showBakery={true} />
            ))}
          </div>
        ) : (
          /* 빈 상태 */
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <div className="text-6xl mb-4">🍞</div>
            <h2 className="text-xl font-bold mb-2">아직 리뷰가 없습니다</h2>
            <p className="text-gray-700 font-medium">
              첫 번째로 빵집을 탐험하고 리뷰를 남겨보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
