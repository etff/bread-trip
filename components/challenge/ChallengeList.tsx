"use client";

import { useState, useEffect } from "react";
import ChallengeCard from "./ChallengeCard";
import CreateChallengeModal from "./CreateChallengeModal";
import type { ChallengeWithBakeries } from "@/types/common";

export default function ChallengeList() {
  const [challenges, setChallenges] = useState<ChallengeWithBakeries[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleChallengeCreated = () => {
    fetchChallenges();
    setShowCreateModal(false);
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
