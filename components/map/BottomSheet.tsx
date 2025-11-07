"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin, Croissant, Heart, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BakeryWithRating } from "@/types/common";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import { addFavorite, removeFavorite, isFavorite } from "@/app/actions/favorites";
import { getUser } from "@/app/actions/auth";

interface BottomSheetProps {
  bakery: BakeryWithRating | null;
  onClose: () => void;
  onViewDetail: (bakery: BakeryWithRating) => void;
  challengeId?: string;
}

export default function BottomSheet({
  bakery,
  onClose,
  onViewDetail,
  challengeId,
}: BottomSheetProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAddingToChallenge, setIsAddingToChallenge] = useState(false);
  const [isAddedToChallenge, setIsAddedToChallenge] = useState(false);

  useEffect(() => {
    if (bakery) {
      document.body.style.overflow = "hidden";

      // 로그인 상태 및 찜 상태 확인
      checkLoginStatus();
      checkFavoriteStatus();
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [bakery]);

  const checkLoginStatus = async () => {
    const user = await getUser();
    setIsLoggedIn(!!user);
  };

  const checkFavoriteStatus = async () => {
    if (!bakery) return;

    const result = await isFavorite(bakery.id);
    setIsFavorited(result.isFavorite);
  };

  const handleToggleFavorite = async () => {
    if (!bakery || isLoadingFavorite) return;

    setIsLoadingFavorite(true);

    try {
      if (isFavorited) {
        const result = await removeFavorite(bakery.id);
        if (result.error) {
          alert(result.error);
        } else {
          setIsFavorited(false);
        }
      } else {
        const result = await addFavorite(bakery.id);
        if (result.error) {
          alert(result.error);
        } else {
          setIsFavorited(true);
        }
      }
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleAddToChallenge = async () => {
    if (!bakery || !challengeId || isAddingToChallenge) return;

    setIsAddingToChallenge(true);

    try {
      const response = await fetch(`/api/challenges/${challengeId}/bakeries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bakery_id: bakery.id,
        }),
      });

      if (response.ok) {
        setIsAddedToChallenge(true);
        setTimeout(() => {
          router.push(`/challenges/${challengeId}`);
        }, 1000);
      } else {
        const data = await response.json();
        alert(data.error || "챌린지에 추가하지 못했습니다.");
      }
    } catch (error) {
      console.error("Failed to add to challenge:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsAddingToChallenge(false);
    }
  };

  if (!bakery) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "w-full max-w-lg mx-auto",
          "bg-white rounded-t-3xl shadow-2xl",
          "max-h-[80vh] overflow-y-auto",
          "animate-in slide-in-from-bottom-full duration-300"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-24">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-brown mb-1">
                {bakery.name}
              </h2>
              <div className="flex items-center text-gray-700 text-sm font-medium mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {bakery.district || "서울"}
              </div>
              {/* 평점 */}
              {bakery.average_rating !== undefined && bakery.average_rating > 0 && (
                <StarRating
                  rating={bakery.average_rating}
                  reviewCount={bakery.review_count}
                  size="sm"
                />
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleFavorite}
                disabled={isLoadingFavorite}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isFavorited
                    ? "bg-red-50 hover:bg-red-100 text-red-500"
                    : "hover:bg-cream text-gray-400 hover:text-red-500",
                  isLoadingFavorite && "opacity-50 cursor-not-allowed"
                )}
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-all",
                    isFavorited && "fill-current"
                  )}
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cream rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Image */}
          {bakery.image_url ? (
            <div className="w-full aspect-[4/3] bg-cream rounded-xl mb-4 overflow-hidden">
              <img
                src={bakery.image_url}
                alt={bakery.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-cream rounded-xl mb-4 flex items-center justify-center">
              <span className="text-6xl">🍞</span>
            </div>
          )}

          {/* Description */}
          {bakery.description && (
            <div className="bg-warm/50 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-bold text-brown mb-2">소개</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {bakery.description}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="space-y-3 mb-6">
            {bakery.signature_bread && (
              <div className="flex items-center gap-2">
                <Croissant className="w-5 h-5 text-brown" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">대표 메뉴</p>
                  <p className="font-semibold text-gray-900">{bakery.signature_bread}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-brown mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 font-medium">주소</p>
                <p className="font-semibold text-gray-900">{bakery.address}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {challengeId && (
              <Button
                className="w-full"
                onClick={handleAddToChallenge}
                disabled={isAddingToChallenge || isAddedToChallenge}
              >
                {isAddedToChallenge ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    추가 완료!
                  </>
                ) : isAddingToChallenge ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    추가 중...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    챌린지에 추가
                  </>
                )}
              </Button>
            )}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  // 카카오맵 길찾기
                  window.open(
                    `https://map.kakao.com/link/to/${bakery.name},${bakery.lat},${bakery.lng}`,
                    "_blank"
                  );
                }}
              >
                길찾기
              </Button>
              <Button className="flex-1" onClick={() => onViewDetail(bakery)}>
                리뷰보기
              </Button>
            </div>
            {isLoggedIn && !challengeId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onViewDetail(bakery)}
              >
                리뷰 작성
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
