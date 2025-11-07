"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, ArrowLeft, Star, Plus } from "lucide-react";
import Link from "next/link";
import type { FavoriteList, BakeryWithRating, User } from "@/types/common";

type FavoriteListResponse = FavoriteList & {
  bakeries?: BakeryWithRating[];
  bakery_count?: number;
  user?: Pick<User, "id" | "nickname" | "profile_image_url">;
};

export default function SharedFavoriteListPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [favoriteList, setFavoriteList] =
    useState<FavoriteListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetchFavoriteList();
  }, [token]);

  const fetchFavoriteList = async () => {
    try {
      const response = await fetch(`/api/favorites/shared/${token}`);
      if (response.ok) {
        const data = await response.json();
        setFavoriteList(data.favoriteList);
      } else if (response.status === 404) {
        alert("찜목록을 찾을 수 없습니다.");
        router.push("/");
      }
    } catch (error) {
      console.error("찜목록 조회 실패:", error);
      alert("오류가 발생했습니다.");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const copyToChallenge = async () => {
    setCopying(true);

    try {
      const response = await fetch(`/api/favorites/shared/${token}/to-challenge`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/challenges/${data.challenge.id}`);
      } else {
        const data = await response.json();
        alert(data.error || "챌린지 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("챌린지 생성 실패:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🍞</div>
          <p className="text-brown font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!favoriteList) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Header */}
      <div className="bg-white border-b border-cream sticky top-0 z-40">
        <div className="max-w-screen-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 -ml-2 hover:bg-cream rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <h1 className="text-2xl font-bold text-brown">
                {favoriteList.name}
              </h1>
            </div>
          </div>

          {/* 공유자 정보 */}
          {favoriteList.user && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center overflow-hidden">
                {favoriteList.user.profile_image_url ? (
                  <img
                    src={favoriteList.user.profile_image_url}
                    alt={favoriteList.user.nickname || "사용자"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/mascot.png"
                    alt="빵지순례 마스코트"
                    className="w-6 h-6 object-contain"
                  />
                )}
              </div>
              <span className="text-sm text-gray-600">
                {favoriteList.user.nickname || "빵지러"}님의 찜목록
              </span>
            </div>
          )}

          {favoriteList.description && (
            <p className="text-sm text-gray-600 mb-3">
              {favoriteList.description}
            </p>
          )}

          {/* 챌린지로 복사 버튼 */}
          {favoriteList.bakeries && favoriteList.bakeries.length > 0 && (
            <button
              onClick={copyToChallenge}
              disabled={copying}
              className="w-full bg-brown text-white px-4 py-2 rounded-lg hover:bg-brown-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {copying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  생성 중...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  내 챌린지로 복사하기
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-md mx-auto px-4 py-6">
        {!favoriteList.bakeries || favoriteList.bakeries.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              빵집이 없어요
            </h3>
            <p className="text-gray-500 text-sm">
              아직 이 찜목록에 빵집이 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {favoriteList.bakeries.map((bakery) => (
              <Link
                key={bakery.id}
                href={`/bakeries/${bakery.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-brown mb-1 truncate">
                      {bakery.name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {bakery.district || "서울"}
                      </span>
                    </div>
                    {bakery.signature_bread && (
                      <p className="text-sm text-gray-500 truncate mb-1">
                        {bakery.signature_bread}
                      </p>
                    )}
                    {bakery.average_rating && bakery.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600">
                          {bakery.average_rating.toFixed(1)} ({bakery.review_count || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
