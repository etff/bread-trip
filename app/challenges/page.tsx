import { Metadata } from "next";
import ChallengeList from "@/components/challenge/ChallengeList";

export const metadata: Metadata = {
  title: "빵지순례 챌린지 | 빵트립",
  description: "가고 싶은 빵집 목록을 만들어 순례를 떠나보세요!",
};

export default function ChallengesPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <ChallengeList />
      </div>
    </main>
  );
}
