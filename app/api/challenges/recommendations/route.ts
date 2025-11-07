import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 주차를 기반으로 시드 생성
function getWeekSeed() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const weekOfYear = Math.floor(dayOfYear / 7);
  return weekOfYear;
}

// 시드 기반 랜덤 셔플
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;

  for (let i = shuffled.length - 1; i > 0; i--) {
    // LCG (Linear Congruential Generator)
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // 모든 빵집 조회 (리뷰 포함)
    const { data: bakeries, error } = await (supabase as any)
      .from("bakeries")
      .select(`
        *,
        reviews(rating)
      `)
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!bakeries || bakeries.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // 평균 평점 계산
    const bakeriesWithRating = bakeries.map((bakery: any) => {
      const reviews = bakery.reviews || [];
      const reviewCount = reviews.length;
      const averageRating =
        reviewCount > 0
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
            reviewCount
          : 0;

      const { reviews: _, ...bakeryData } = bakery;
      return {
        ...bakeryData,
        review_count: reviewCount,
        average_rating: Math.round(averageRating * 10) / 10,
      };
    });

    // 평점이 있는 빵집만 필터링하고 정렬
    const ratedBakeries = bakeriesWithRating
      .filter((b: any) => b.review_count > 0)
      .sort((a: any, b: any) => {
        if (b.average_rating !== a.average_rating) {
          return b.average_rating - a.average_rating;
        }
        return b.review_count - a.review_count;
      });

    // 상위 20개 중에서 선택
    const topBakeries = ratedBakeries.slice(0, 20);

    // 주차별 시드로 셔플
    const weekSeed = getWeekSeed();
    const shuffled = seededShuffle(topBakeries, weekSeed);

    // 추천 챌린지 생성
    const recommendations: any[] = [];

    // 1. 이번주 3코스 빵투어 (지역 다양하게)
    const tourBakeries: any[] = [];
    const usedDistricts = new Set<string>();

    for (const bakery of shuffled) {
      if (tourBakeries.length >= 3) break;
      if ((bakery as any).district && !usedDistricts.has((bakery as any).district)) {
        tourBakeries.push(bakery);
        usedDistricts.add((bakery as any).district);
      }
    }

    // 지역이 3개가 안되면 그냥 상위 3개
    while (tourBakeries.length < 3 && tourBakeries.length < shuffled.length) {
      const bakery = shuffled[tourBakeries.length];
      if (!tourBakeries.includes(bakery)) {
        tourBakeries.push(bakery);
      }
    }

    if (tourBakeries.length === 3) {
      recommendations.push({
        id: "weekly-tour",
        name: "이번주 3코스 빵투어",
        description: "에디터가 선정한 이번 주 꼭 가봐야 할 빵집 3곳",
        icon: "🗺️",
        bakeries: tourBakeries,
        difficulty: "쉬움",
      });
    }

    // 2. 평점 맛집 5선
    const topRatedBakeries = shuffled.slice(0, 5);
    if (topRatedBakeries.length === 5) {
      recommendations.push({
        id: "top-rated",
        name: "평점 맛집 5선",
        description: "높은 평점을 받은 검증된 빵집들",
        icon: "⭐",
        bakeries: topRatedBakeries,
        difficulty: "보통",
      });
    }

    // 3. 서울 핫플 투어 (지역별)
    const seoulBakeries = shuffled
      .filter((b: any) =>
        (b as any).district &&
        ["성수", "망원", "홍대", "연남", "이태원", "경리단길", "한남"].includes((b as any).district)
      )
      .slice(0, 4);

    if (seoulBakeries.length >= 3) {
      recommendations.push({
        id: "seoul-hotplace",
        name: "서울 핫플 투어",
        description: "트렌디한 서울 핫플레이스 빵집 모음",
        icon: "🏙️",
        bakeries: seoulBakeries,
        difficulty: "보통",
      });
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
