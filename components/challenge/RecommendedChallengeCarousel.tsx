"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RecommendedChallengeCard from "./RecommendedChallengeCard";
import type { RecommendedChallenge } from "@/types/common";

interface RecommendedChallengeCarouselProps {
  recommendations: RecommendedChallenge[];
  onStart: (recommendation: RecommendedChallenge) => void;
}

export default function RecommendedChallengeCarousel({
  recommendations,
  onStart,
}: RecommendedChallengeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // 최소 스와이프 거리 (px)
  const minSwipeDistance = 50;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? recommendations.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === recommendations.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="relative">
      {/* 캐루셀 컨테이너 */}
      <div
        className="overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="w-full flex-shrink-0 px-1">
              <RecommendedChallengeCard
                recommendation={recommendation}
                onStart={onStart}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      {recommendations.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white rounded-full p-2 shadow-lg hover:bg-cream transition-colors z-10"
            aria-label="이전 추천"
          >
            <ChevronLeft className="w-5 h-5 text-brown" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white rounded-full p-2 shadow-lg hover:bg-cream transition-colors z-10"
            aria-label="다음 추천"
          >
            <ChevronRight className="w-5 h-5 text-brown" />
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {recommendations.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {recommendations.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-brown" : "w-2 bg-brown/30"
              }`}
              aria-label={`${index + 1}번째 추천으로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
