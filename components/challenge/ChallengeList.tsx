"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChallengeCard from "./ChallengeCard";
import CreateChallengeModal from "./CreateChallengeModal";
import RecommendedChallengeCard from "./RecommendedChallengeCard";
import type { ChallengeWithBakeries, RecommendedChallenge } from "@/types/common";
import { Sparkles } from "lucide-react";

export default function ChallengeList() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengeWithBakeries[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges");
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/challenges/recommendations");
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
    fetchRecommendations();
  }, []);

  const handleChallengeCreated = () => {
    fetchChallenges();
    setShowCreateModal(false);
  };

  const handleStartRecommendation = async (recommendation: RecommendedChallenge) => {
    try {
      // 챌린지 생성
      const createResponse = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: recommendation.name,
          description: recommendation.description,
          is_public: false,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create challenge");
      }

      const { challenge } = await createResponse.json();

      // 빵집들 추가
      for (const bakery of recommendation.bakeries) {
        await fetch(`/api/challenges/${challenge.id}/bakeries`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bakery_id: bakery.id,
          }),
        });
      }

      // 챌린지 상세 페이지로 이동
      router.push(`/challenges/${challenge.id}`);
    } catch (error) {
      console.error("Failed to start recommendation:", error);
      alert("챌린지 생성에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-brown">나의 빵지순례</h2>
          <p className="text-sm text-gray-600 mt-1">
            가고 싶은 빵집 목록을 만들어 순례를 떠나보세요!
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-brown text-white px-4 py-2 rounded-lg hover:bg-brown-dark transition-colors font-medium"
        >
          + 새 챌린지
        </button>
      </div>

      {/* 추천 챌린지 섹션 */}
      {!recommendationsLoading && recommendations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold text-brown">이번 주 추천 챌린지</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((recommendation) => (
              <RecommendedChallengeCard
                key={recommendation.id}
                recommendation={recommendation}
                onStart={handleStartRecommendation}
              />
            ))}
          </div>
        </div>
      )}

      {/* 구분선 */}
      {!recommendationsLoading && recommendations.length > 0 && (
        <div className="border-t-2 border-brown/10 my-8"></div>
      )}

      <h3 className="text-xl font-bold text-brown mb-4">내 챌린지</h3>

      {challenges.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎒</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            아직 챌린지가 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            첫 번째 빵지순례 챌린지를 만들어보세요!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-brown text-white px-6 py-3 rounded-lg hover:bg-brown-dark transition-colors font-medium"
          >
            챌린지 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleChallengeCreated}
        />
      )}
    </div>
  );
}
