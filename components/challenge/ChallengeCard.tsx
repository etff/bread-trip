"use client";

import Link from "next/link";
import type { ChallengeWithBakeries } from "@/types/common";

interface ChallengeCardProps {
  challenge: ChallengeWithBakeries;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { id, name, description, total_count, visited_count, progress_percentage } =
    challenge;

  return (
    <Link href={`/challenges/${id}`}>
      <div className="bg-white rounded-xl p-5 border-2 border-brown hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-brown mb-1">{name}</h3>
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            )}
          </div>
          <div className="ml-3">
            <div className="w-16 h-16 rounded-full bg-brown/10 flex items-center justify-center">
              <span className="text-2xl">🎒</span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">진행률</span>
            <span className="font-bold text-brown">
              {visited_count} / {total_count}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-brown h-2.5 rounded-full transition-all"
              style={{ width: `${progress_percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {total_count}개의 빵집
            </span>
            {progress_percentage === 100 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                완료!
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-brown">
            {progress_percentage}%
          </span>
        </div>
      </div>
    </Link>
  );
}
