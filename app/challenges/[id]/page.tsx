"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ChallengeWithBakeries, Bakery } from "@/types/common";
import ChallengeMap from "@/components/challenge/ChallengeMap";
import BakeryCheckItem from "@/components/challenge/BakeryCheckItem";
import ShareChallengeModal from "@/components/challenge/ShareChallengeModal";
import { ArrowLeft, Share2, Edit2, Trash2, MapPin, Plus } from "lucide-react";

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [challenge, setChallenge] = useState<ChallengeWithBakeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`/api/challenges/${id}`);
      if (response.ok) {
        const data = await response.json();
        setChallenge(data.challenge);
      } else if (response.status === 404) {
        router.push("/challenges");
      }
    } catch (error) {
      console.error("Failed to fetch challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  const handleToggleVisit = async (bakeryId: string, visited: boolean) => {
    try {
      const response = await fetch(
        `/api/challenges/${id}/bakeries/${bakeryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ visited }),
        }
      );

      if (response.ok) {
        fetchChallenge();
      }
    } catch (error) {
      console.error("Failed to toggle visit:", error);
    }
  };

  const handleRemoveBakery = async (bakeryId: string) => {
    try {
      const response = await fetch(
        `/api/challenges/${id}/bakeries/${bakeryId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchChallenge();
      }
    } catch (error) {
      console.error("Failed to remove bakery:", error);
    }
  };

  const handleDeleteChallenge = async () => {
    if (!confirm("정말 이 챌린지를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/challenges");
      }
    } catch (error) {
      console.error("Failed to delete challenge:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown"></div>
      </main>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-screen-md mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 text-brown hover:text-brown-dark mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            챌린지 목록으로
          </Link>

          <div className="bg-white rounded-xl p-6 border-2 border-brown">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-brown mb-2">
                  {challenge.name}
                </h1>
                {challenge.description && (
                  <p className="text-gray-600">{challenge.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 text-brown hover:bg-cream rounded-lg transition-colors"
                  title="공유하기"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDeleteChallenge}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
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

        {/* 빵집 목록 */}
        <div className="bg-white rounded-xl p-6 border-2 border-brown">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brown">빵집 목록</h2>
            <Link
              href={`/?challenge=${id}`}
              className="flex items-center gap-2 text-sm bg-brown text-white px-4 py-2 rounded-lg hover:bg-brown-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              빵집 추가
            </Link>
          </div>

          {challenge.bakeries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🥖</div>
              <p className="text-gray-600 mb-4">
                아직 빵집이 없습니다. 빵집을 추가해보세요!
              </p>
              <Link
                href={`/?challenge=${id}`}
                className="inline-flex items-center gap-2 bg-brown text-white px-6 py-3 rounded-lg hover:bg-brown-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                빵집 추가하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {challenge.bakeries.map((cb) => (
                <BakeryCheckItem
                  key={cb.id}
                  challengeBakery={cb}
                  challengeId={id}
                  onToggleVisit={handleToggleVisit}
                  onRemove={handleRemoveBakery}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareChallengeModal
          challengeId={id}
          challengeName={challenge.name}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </main>
  );
}
