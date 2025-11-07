"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChallengeBakeryWithBakery } from "@/types/common";
import { MapPin, Star, CheckCircle2, Circle, Trash2 } from "lucide-react";

interface BakeryCheckItemProps {
  challengeBakery: ChallengeBakeryWithBakery;
  challengeId: string;
  onToggleVisit: (bakeryId: string, visited: boolean) => Promise<void>;
  onRemove: (bakeryId: string) => Promise<void>;
}

export default function BakeryCheckItem({
  challengeBakery,
  challengeId,
  onToggleVisit,
  onRemove,
}: BakeryCheckItemProps) {
  const { bakery, visited_at } = challengeBakery;
  const [loading, setLoading] = useState(false);
  const isVisited = !!visited_at;

  const handleToggleVisit = async () => {
    setLoading(true);
    try {
      await onToggleVisit(bakery.id, !isVisited);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("이 빵집을 챌린지에서 제거하시겠습니까?")) return;

    setLoading(true);
    try {
      await onRemove(bakery.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
        isVisited
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200 hover:border-brown"
      }`}
    >
      {/* 체크박스 */}
      <button
        onClick={handleToggleVisit}
        disabled={loading}
        className="flex-shrink-0"
      >
        {isVisited ? (
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        ) : (
          <Circle className="w-6 h-6 text-gray-300 hover:text-brown transition-colors" />
        )}
      </button>

      {/* 빵집 이미지 */}
      <Link href={`/bakeries/${bakery.id}`} className="flex-shrink-0">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          {bakery.image_url ? (
            <img
              src={bakery.image_url}
              alt={bakery.name}
              className="w-full h-full object-cover"
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
            <span className="truncate">{bakery.district || bakery.address}</span>
          </div>
          {bakery.average_rating !== undefined && bakery.average_rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-gray-600">
                {bakery.average_rating.toFixed(1)} ({bakery.review_count || 0})
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* 삭제 버튼 */}
      <button
        onClick={handleRemove}
        disabled={loading}
        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
