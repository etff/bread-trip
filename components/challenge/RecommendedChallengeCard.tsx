"use client";

import { useState } from "react";
import type { RecommendedChallenge } from "@/types/common";
import { MapPin, Star, Sparkles } from "lucide-react";

interface RecommendedChallengeCardProps {
  recommendation: RecommendedChallenge;
  onStart: (recommendation: RecommendedChallenge) => Promise<void>;
}

export default function RecommendedChallengeCard({
  recommendation,
  onStart,
}: RecommendedChallengeCardProps) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStart(recommendation);
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = {
    쉬움: "bg-green-100 text-green-700",
    보통: "bg-yellow-100 text-yellow-700",
    어려움: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-brown/20 hover:border-brown hover:shadow-lg transition-all">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brown/10 flex items-center justify-center text-2xl">
            {recommendation.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-brown flex items-center gap-2">
              {recommendation.name}
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {recommendation.description}
            </p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            difficultyColor[recommendation.difficulty]
          }`}
        >
          {recommendation.difficulty}
        </span>
      </div>

      {/* 빵집 미리보기 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {recommendation.bakeries.length}개 빵집
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {recommendation.bakeries.slice(0, 3).map((bakery) => (
            <div
              key={bakery.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              {bakery.image_url ? (
                <img
                  src={bakery.image_url}
                  alt={bakery.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  🥖
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                <div className="text-white text-xs font-medium line-clamp-1">
                  {bakery.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 빵집 목록 */}
        <div className="mt-3 space-y-1">
          {recommendation.bakeries.map((bakery) => (
            <div
              key={bakery.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-medium text-gray-900 truncate">
                  {bakery.name}
                </span>
                <span className="text-gray-500 text-xs">{bakery.district}</span>
              </div>
              {bakery.average_rating && bakery.average_rating > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-gray-600">
                    {bakery.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 시작 버튼 */}
      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full bg-brown text-white px-4 py-3 rounded-lg hover:bg-brown-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            생성 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            이 챌린지로 시작하기
          </>
        )}
      </button>
    </div>
  );
}
