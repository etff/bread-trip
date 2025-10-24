"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import AuthModal from "@/components/layout/AuthModal";
import { signOut } from "@/app/actions/auth";

export default function ProfilePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // TODO: 실제 유저 정보 가져오기

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

        {user ? (
          <div className="space-y-6">
            {/* 프로필 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-2xl">
                  🍞
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {user.nickname || "빵지러"}
                  </h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brown">0</p>
                  <p className="text-sm text-gray-500">찜한 빵집</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brown">0</p>
                  <p className="text-sm text-gray-500">작성한 리뷰</p>
                </div>
              </div>
            </div>

            {/* 찜한 빵집 섹션 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">찜한 빵집</h3>
              <div className="text-center py-8 text-gray-500">
                아직 찜한 빵집이 없습니다
              </div>
            </div>

            {/* 로그아웃 버튼 */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full text-gray-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        ) : (
          // 로그인 안 한 상태
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-6xl mb-4">🍞</div>
            <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
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
