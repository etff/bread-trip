"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import type { ChallengeWithBakeries } from "@/types/common";
import ChallengeMap from "@/components/challenge/ChallengeMap";
import Image from "next/image";
import { MapPin, Star, CheckCircle2, Circle } from "lucide-react";

export default function SharedChallengePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [challenge, setChallenge] = useState<ChallengeWithBakeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch(`/api/challenges/shared/${token}`);
        if (response.ok) {
          const data = await response.json();
          setChallenge(data.challenge);
        }
      } catch (error) {
        console.error("Failed to fetch shared challenge:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown"></div>
      </main>
    );
  }

  if (!challenge) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            챌린지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-500 mb-6">
            공유 링크가 만료되었거나 잘못되었습니다.
          </p>
          <Link
            href="/"
            className="inline-block bg-brown text-white px-6 py-3 rounded-lg hover:bg-brown-dark transition-colors"
          >
            홈으로 이동
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-xl p-6 border-2 border-brown mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="inline-block bg-brown/10 text-brown text-xs font-medium px-3 py-1 rounded-full mb-3">
                공유된 챌린지
              </div>
              <h1 className="text-3xl font-bold text-brown mb-2">
                {challenge.name}
              </h1>
              {challenge.description && (
                <p className="text-gray-600">{challenge.description}</p>
              )}
            </div>
          </div>

          {/* 진행률 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">진행률</span>
              <span className="font-bold text-brown">
                {challenge.visited_count} / {challenge.total_count}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-brown h-3 rounded-full transition-all"
                style={{ width: `${challenge.progress_percentage}%` }}
              ></div>
            </div>
          </div>

          {/* 통계 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                총 {challenge.total_count}개의 빵집
              </span>
              {challenge.progress_percentage === 100 && (
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  챌린지 완료!
                </span>
              )}
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 text-brown hover:bg-cream px-3 py-1.5 rounded-lg transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {showMap ? "지도 숨기기" : "지도 보기"}
            </button>
          </div>
        </div>

        {/* 지도 */}
        {showMap && challenge.bakeries.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl p-4 border-2 border-brown">
              <div className="h-[400px]">
                <ChallengeMap challengeBakeries={challenge.bakeries} />
              </div>
            </div>
          </div>
        )}

        {/* 빵집 목록 (읽기 전용) */}
        <div className="bg-white rounded-xl p-6 border-2 border-brown">
          <h2 className="text-xl font-bold text-brown mb-4">빵집 목록</h2>

          {challenge.bakeries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🥖</div>
              <p className="text-gray-600">아직 빵집이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenge.bakeries.map((cb) => {
                const { bakery, visited_at } = cb;
                const isVisited = !!visited_at;

                return (
                  <div
                    key={cb.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
                      isVisited
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {/* 체크 표시 */}
                    <div className="flex-shrink-0">
                      {isVisited ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                    </div>

                    {/* 빵집 이미지 */}
                    <Link href={`/bakeries/${bakery.id}`} className="flex-shrink-0">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {bakery.image_url ? (
                          <Image
                            src={bakery.image_url}
                            alt={bakery.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🥖
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* 빵집 정보 */}
                    <Link href={`/bakeries/${bakery.id}`} className="flex-1 min-w-0">
                      <div>
                        <h3
                          className={`font-bold ${
                            isVisited ? "text-green-800 line-through" : "text-brown"
                          }`}
                        >
                          {bakery.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {bakery.district || bakery.address}
                          </span>
                        </div>
                        {bakery.average_rating !== undefined &&
                          bakery.average_rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-gray-600">
                                {bakery.average_rating.toFixed(1)} (
                                {bakery.review_count || 0})
                              </span>
                            </div>
                          )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-6 bg-brown/10 rounded-xl p-6 text-center border-2 border-brown/20">
          <p className="text-brown font-medium mb-3">
            이 챌린지가 마음에 드시나요?
          </p>
          <Link
            href="/challenges"
            className="inline-block bg-brown text-white px-6 py-3 rounded-lg hover:bg-brown-dark transition-colors font-medium"
          >
            내 챌린지 만들기
          </Link>
        </div>
      </div>
    </main>
  );
}
