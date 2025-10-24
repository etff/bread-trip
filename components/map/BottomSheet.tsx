"use client";

import { useEffect } from "react";
import { X, MapPin, Croissant } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bakery } from "@/types/common";
import Button from "@/components/ui/Button";

interface BottomSheetProps {
  bakery: Bakery | null;
  onClose: () => void;
  onViewDetail: (bakery: Bakery) => void;
}

export default function BottomSheet({
  bakery,
  onClose,
  onViewDetail,
}: BottomSheetProps) {
  useEffect(() => {
    if (bakery) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [bakery]);

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
              <div className="flex items-center text-gray-700 text-sm font-medium">
                <MapPin className="w-4 h-4 mr-1" />
                {bakery.district || "서울"}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cream rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Image */}
          {bakery.image_url ? (
            <div className="w-full h-48 bg-cream rounded-xl mb-4 overflow-hidden">
              <img
                src={bakery.image_url}
                alt={bakery.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-cream rounded-xl mb-4 flex items-center justify-center">
              <span className="text-6xl">🍞</span>
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
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onViewDetail(bakery)}
            >
              리뷰 작성
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
