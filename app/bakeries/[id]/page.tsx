"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Croissant,
  Heart,
  Phone,
  Clock,
  Car,
  Wifi,
  Dog,
  Globe,
  Instagram,
  DollarSign,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import ReviewModal from "@/components/review/ReviewModal";
import ReviewCard from "@/components/review/ReviewCard";
import { getUser } from "@/app/actions/auth";
import { deleteReview } from "@/app/actions/reviews";
import type { BakeryWithThemes, ReviewWithUser, Review } from "@/types/common";

export default function BakeryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bakery, setBakery] = useState<BakeryWithThemes | null>(null);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<Review | undefined>(undefined);

  useEffect(() => {
    if (params.id) {
      fetchBakery(params.id as string);
      fetchReviews(params.id as string);
      checkLoginStatus();
    }
  }, [params.id]);

  const checkLoginStatus = async () => {
    const user = await getUser();
    setIsLoggedIn(!!user);
    setCurrentUserId(user?.id || null);
  };

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

  const handleEditReview = (review: ReviewWithUser) => {
    setEditingReview(review as Review);
    setIsReviewModalOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    const result = await deleteReview(reviewId);

    if (result.error) {
      alert(result.error);
    } else {
      alert("리뷰가 삭제되었습니다.");
      // 리뷰 목록에서 제거
      setReviews(reviews.filter((r) => r.id !== reviewId));
      // 빵집 정보 새로고침 (평점 업데이트)
      if (bakery) {
        fetchBakery(bakery.id);
      }
    }
  };

  const handleReviewModalClose = () => {
    setIsReviewModalOpen(false);
    setEditingReview(undefined);
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
              <p className="text-gray-700 font-semibold mb-2">📍 {bakery.district}</p>
            )}
            {/* 평점 */}
            {bakery.average_rating !== undefined && bakery.average_rating > 0 && (
              <StarRating
                rating={bakery.average_rating}
                reviewCount={bakery.review_count}
                size="md"
              />
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

          {/* 실용 정보 카드 */}
          {(bakery.phone ||
            bakery.hours ||
            bakery.closed_days ||
            bakery.price_range ||
            bakery.parking_available ||
            bakery.wifi_available ||
            bakery.pet_friendly ||
            bakery.website_url ||
            bakery.instagram_url) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-brown">실용 정보</h3>
              <div className="space-y-4">
                {bakery.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-brown mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">전화번호</p>
                      <a
                        href={`tel:${bakery.phone}`}
                        className="font-semibold text-gray-900 hover:text-brown"
                      >
                        {bakery.phone}
                      </a>
                    </div>
                  </div>
                )}

                {bakery.hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-brown mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">영업시간</p>
                      <p className="font-semibold text-gray-900 whitespace-pre-line">
                        {bakery.hours}
                      </p>
                    </div>
                  </div>
                )}

                {bakery.closed_days && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-brown mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">휴무일</p>
                      <p className="font-semibold text-gray-900">{bakery.closed_days}</p>
                    </div>
                  </div>
                )}

                {bakery.price_range && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-brown mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">가격대</p>
                      <p className="font-semibold text-gray-900">{bakery.price_range}</p>
                    </div>
                  </div>
                )}

                {(bakery.parking_available ||
                  bakery.wifi_available ||
                  bakery.pet_friendly) && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">편의시설</p>
                      <div className="flex flex-wrap gap-2">
                        {bakery.parking_available && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream rounded-full text-sm font-semibold text-brown">
                            <Car className="w-4 h-4" />
                            주차 가능
                          </span>
                        )}
                        {bakery.wifi_available && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream rounded-full text-sm font-semibold text-brown">
                            <Wifi className="w-4 h-4" />
                            와이파이
                          </span>
                        )}
                        {bakery.pet_friendly && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream rounded-full text-sm font-semibold text-brown">
                            <Dog className="w-4 h-4" />
                            반려동물
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(bakery.website_url || bakery.instagram_url) && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">링크</p>
                      <div className="flex flex-wrap gap-2">
                        {bakery.website_url && (
                          <a
                            href={bakery.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-cream rounded-full text-sm font-semibold text-brown hover:bg-brown hover:text-white transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            웹사이트
                          </a>
                        )}
                        {bakery.instagram_url && (
                          <a
                            href={bakery.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-cream rounded-full text-sm font-semibold text-brown hover:bg-brown hover:text-white transition-colors"
                          >
                            <Instagram className="w-4 h-4" />
                            인스타그램
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 테마 섹션 */}
          {bakery.themes && bakery.themes.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-3">테마</h3>
              <div className="flex flex-wrap gap-2">
                {bakery.themes.map((theme) => (
                  <Link
                    key={theme.id}
                    href={`/themes/${theme.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      backgroundColor: theme.color
                        ? `${theme.color}20`
                        : "#f5e6d3",
                      color: theme.color || "#8B4513",
                    }}
                  >
                    <span>{theme.icon || "🍞"}</span>
                    <span>{theme.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
                    currentUserId={currentUserId || undefined}
                    onEdit={() => handleEditReview(review)}
                    onDelete={() => handleDeleteReview(review.id)}
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
          <div className={`grid ${isLoggedIn ? 'grid-cols-2' : 'grid-cols-1'} gap-3 pb-6`}>
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
            {isLoggedIn && (
              <Button onClick={() => setIsReviewModalOpen(true)}>
                리뷰 작성
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 리뷰 작성/수정 모달 */}
      {bakery && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleReviewModalClose}
          bakery={bakery}
          editingReview={editingReview}
          onSuccess={() => {
            fetchReviews(bakery.id);
            fetchBakery(bakery.id); // 평점 업데이트
          }}
        />
      )}
    </div>
  );
}
