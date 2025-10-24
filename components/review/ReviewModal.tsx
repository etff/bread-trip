"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Bakery } from "@/types/common";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bakery: Bakery;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  bakery,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("평점을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bakery_id: bakery.id,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("리뷰가 등록되었습니다!");
        setRating(0);
        setComment("");
        onSuccess?.();
        onClose();
      } else {
        alert(data.error || "리뷰 등록에 실패했습니다.");
      }
    } catch (error) {
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${bakery.name} 리뷰 작성`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 평점 선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3 text-center">
            이 빵집은 어떠셨나요?
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-10 h-10",
                    (hoveredRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-800 font-semibold mt-2">
              {rating === 1 && "별로예요"}
              {rating === 2 && "그저 그래요"}
              {rating === 3 && "괜찮아요"}
              {rating === 4 && "좋아요"}
              {rating === 5 && "최고예요!"}
            </p>
          )}
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            리뷰 (선택)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="빵집에 대한 경험을 공유해주세요..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent resize-none placeholder:text-gray-600 placeholder:font-medium text-gray-900 font-medium"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "등록 중..." : "리뷰 등록"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
