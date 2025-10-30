"use client";

import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import AuthModal from "@/components/layout/AuthModal";
import ReviewCard from "@/components/review/ReviewCard";
import { signOut, getUser } from "@/app/actions/auth";
import type { ReviewWithUser, ReviewWithBakery } from "@/types/common";

export default function ProfilePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<(ReviewWithUser & ReviewWithBakery)[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserReviews();
    }
  }, [user?.id]);

  const fetchUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    if (!user?.id) return;

    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/reviews?userId=${user.id}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("리뷰 로드 실패:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-screen-md mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brown">프로필</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce">🍞</div>
              <p className="text-brown font-medium">로딩 중...</p>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* 프로필 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center overflow-hidden">
                  {user.profile_image_url ? (
                    <img
                      src={user.profile_image_url}
                      alt={user.nickname || "프로필"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="/mascot.png"
                      alt="빵지순례 마스코트"
                      className="w-12 h-12 object-contain"
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {user.nickname || "빵지러"}
                  </h2>
                  <p className="text-sm text-gray-800 font-semibold">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brown">0</p>
                  <p className="text-sm text-gray-800 font-bold">찜한 빵집</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brown">
                    {reviewsLoading ? "..." : reviews.length}
                  </p>
                  <p className="text-sm text-gray-800 font-bold">작성한 리뷰</p>
                </div>
              </div>
            </div>

            {/* 작성한 리뷰 섹션 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">작성한 리뷰</h3>
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="text-4xl mb-2 animate-bounce">🍞</div>
                    <p className="text-gray-800 font-medium">로딩 중...</p>
                  </div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} showBakery={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-800 font-semibold">
                  아직 작성한 리뷰가 없습니다
                </div>
              )}
            </div>

            {/* 찜한 빵집 섹션 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">찜한 빵집</h3>
              <div className="text-center py-8 text-gray-800 font-semibold">
                아직 찜한 빵집이 없습니다
              </div>
            </div>

            {/* 로그아웃 버튼 */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full text-gray-800 font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        ) : (
          // 로그인 안 한 상태
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-6xl mb-4">🍞</div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">로그인이 필요합니다</h2>
            <p className="text-gray-800 mb-6 font-semibold">
              로그인하고 나만의 빵지순례를 시작하세요
            </p>
            <Button onClick={() => setIsAuthModalOpen(true)} className="w-full">
              로그인하기
            </Button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
