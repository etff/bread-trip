import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 작성한 리뷰 조회 (빵집 정보 포함)
    const { data: reviews } = await (supabase as any)
      .from("reviews")
      .select(
        `
        id,
        rating,
        bakery:bakeries (
          id,
          district,
          name
        )
      `
      )
      .eq("user_id", user.id);

    // 찜한 빵집 수 조회
    const { count: favoritesCount } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // 통계 계산
    const reviewCount = reviews?.length || 0;
    const visitedBakeries = new Set(
      reviews?.map((r: any) => r.bakery?.id).filter((id: any) => id)
    );
    const visitedBakeriesCount = visitedBakeries.size;

    // 평균 평점 계산
    const averageRating =
      reviewCount > 0
        ? reviews!.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
        : 0;

    // 지역별 분포 계산
    const regionDistribution: Record<string, number> = {};
    reviews?.forEach((review: any) => {
      const district = review.bakery?.district || "기타";
      regionDistribution[district] = (regionDistribution[district] || 0) + 1;
    });

    // 지역별 분포를 배열로 변환 (차트용)
    const regionData = Object.entries(regionDistribution).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // 테마별 분포 (빵집-테마 조인 필요)
    const bakeryIds = Array.from(visitedBakeries);
    let themeDistribution: Record<string, number> = {};

    if (bakeryIds.length > 0) {
      const { data: bakeryThemes } = await (supabase as any)
        .from("bakery_themes")
        .select(
          `
          theme:themes (
            id,
            name,
            icon
          )
        `
        )
        .in("bakery_id", bakeryIds);

      bakeryThemes?.forEach((bt: any) => {
        if (bt.theme) {
          const themeName = bt.theme.name;
          themeDistribution[themeName] = (themeDistribution[themeName] || 0) + 1;
        }
      });
    }

    const themeData = Object.entries(themeDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      stats: {
        visitedBakeriesCount,
        reviewCount,
        favoritesCount: favoritesCount || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        regionDistribution: regionData,
        themeDistribution: themeData,
      },
    });
  } catch (error) {
    console.error("통계 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
