import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient();

    const { token } = await params;

    // 공유 토큰으로 챌린지 조회 (공개 챌린지만)
    const { data: challenge, error } = await (supabase as any)
      .from("challenges")
      .select(
        `
        *,
        challenge_bakeries (
          id,
          bakery_id,
          order_num,
          visited_at,
          created_at,
          bakery:bakeries (
            id,
            name,
            address,
            district,
            lat,
            lng,
            signature_bread,
            image_url,
            reviews(rating)
          )
        )
      `
      )
      .eq("share_token", token)
      .eq("is_public", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "공유된 챌린지를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 진행률 계산 및 평점 정보 추가
    const bakeries = challenge.challenge_bakeries || [];
    const totalCount = bakeries.length;
    const visitedCount = bakeries.filter((cb: any) => cb.visited_at).length;
    const progressPercentage =
      totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

    // 각 빵집에 평균 평점 계산
    const bakeriesWithRating = bakeries.map((cb: any) => {
      const bakery = cb.bakery;
      if (!bakery) return cb;

      const reviews = bakery.reviews || [];
      const reviewCount = reviews.length;
      const averageRating =
        reviewCount > 0
          ? reviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0
            ) / reviewCount
          : 0;

      const { reviews: _, ...bakeryData } = bakery;
      return {
        ...cb,
        bakery: {
          ...bakeryData,
          review_count: reviewCount,
          average_rating: Math.round(averageRating * 10) / 10,
        },
      };
    });

    const { challenge_bakeries: _, ...challengeData } = challenge;
    const challengeWithProgress = {
      ...challengeData,
      bakeries: bakeriesWithRating,
      total_count: totalCount,
      visited_count: visitedCount,
      progress_percentage: progressPercentage,
    };

    return NextResponse.json({ challenge: challengeWithProgress });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
