"use client";

import { useState, useEffect } from "react";
import { LogOut, Heart, ChevronRight, MapPin, Star, Award } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import AuthModal from "@/components/layout/AuthModal";
import ReviewCard from "@/components/review/ReviewCard";
import StatsCard from "@/components/profile/StatsCard";
import RegionChart from "@/components/profile/RegionChart";
import BadgeCard from "@/components/profile/BadgeCard";
import ActivityTimeline, { type Activity } from "@/components/profile/ActivityTimeline";
import { signOut, getUser } from "@/app/actions/auth";
import { getFavorites } from "@/app/actions/favorites";
import type { ReviewWithUser, ReviewWithBakery } from "@/types/common";

export default function ProfilePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<(ReviewWithUser & ReviewWithBakery)[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // 새로운 통계 관련 상태
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserReviews();
      fetchFavoritesCount();
      fetchUserStats();
      fetchUserBadges();
      fetchUserActivities();
    }
  }, [user?.id]);

  const fetchUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    if (!user?.id) return;

    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/reviews?userId=${user.id}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("리뷰 로드 실패:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchFavoritesCount = async () => {
    setFavoritesLoading(true);
    try {
      const result = await getFavorites();
      setFavoritesCount(result.data?.length || 0);
    } catch (error) {
      console.error("찜 목록 로드 실패:", error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchUserStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch("/api/users/stats");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("통계 로드 실패:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUserBadges = async () => {
    setBadgesLoading(true);
    try {
      const response = await fetch("/api/users/badges");
      const data = await response.json();
      setBadges(data.badges || []);
    } catch (error) {
      console.error("배지 로드 실패:", error);
    } finally {
      setBadgesLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    setActivitiesLoading(true);
    try {
      const response = await fetch("/api/users/activities");
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("활동 내역 로드 실패:", error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-screen-md mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brown">프로필</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce">🍞</div>
              <p className="text-brown font-medium">로딩 중...</p>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* 프로필 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center overflow-hidden">
                  {user.profile_image_url ? (
                    <img
                      src={user.profile_image_url}
                      alt={user.nickname || "프로필"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="/mascot.png"
                      alt="빵지순례 마스코트"
                      className="w-12 h-12 object-contain"
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {user.nickname || "빵지러"}
                  </h2>
                  <p className="text-sm text-gray-800 font-semibold">{user.email}</p>
                </div>
              </div>
            </div>

            {/* 빵지순례 챌린지 링크 */}
            <Link
              href="/challenges"
              className="bg-gradient-to-r from-brown to-brown-dark rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎒</span>
                  <div>
                    <h3 className="font-bold text-white">빵지순례 챌린지</h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      가고 싶은 빵집 목록 만들기
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </Link>

            {/* 통계 카드 그리드 */}
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-bounce">🍞</div>
                  <p className="text-brown font-medium">통계 로딩 중...</p>
                </div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  icon={MapPin}
                  label="방문한 빵집"
                  value={stats.visitedBakeriesCount}
                  color="#8B4513"
                />
                <StatsCard
                  icon={Star}
                  label="작성한 리뷰"
                  value={stats.reviewCount}
                  color="#D2691E"
                />
                <StatsCard
                  icon={Heart}
                  label="찜한 빵집"
                  value={stats.favoritesCount}
                  color="#EF4444"
                />
                <StatsCard
                  icon={Award}
                  label="평균 평점"
                  value={`${stats.averageRating}점`}
                  color="#F59E0B"
                />
              </div>
            ) : null}

            {/* 지역별 분포 차트 */}
            {!statsLoading && stats && (
              <RegionChart data={stats.regionDistribution} />
            )}

            {/* 배지 섹션 */}
            {badgesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-bounce">🍞</div>
                  <p className="text-brown font-medium">배지 로딩 중...</p>
                </div>
              </div>
            ) : badges.length > 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-brown mb-4">
                  획득한 배지 ({badges.filter((b) => b.earned).length}/{badges.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {badges.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      earned={badge.earned}
                      earnedAt={badge.earnedAt}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* 최근 활동 타임라인 */}
            {!activitiesLoading && <ActivityTimeline activities={activities} />}

            {/* 찜한 빵집 링크 */}
            <Link
              href="/favorites"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <h3 className="font-bold text-gray-900">찜한 빵집</h3>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <span className="text-sm font-medium">
                    {stats ? `${stats.favoritesCount}개` : "..."}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* 로그아웃 버튼 */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full text-gray-800 font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        ) : (
          // 로그인 안 한 상태
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-6xl mb-4">🍞</div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">로그인이 필요합니다</h2>
            <p className="text-gray-800 mb-6 font-semibold">
              로그인하고 나만의 빵지순례를 시작하세요
            </p>
            <Button onClick={() => setIsAuthModalOpen(true)} className="w-full">
              로그인하기
            </Button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
