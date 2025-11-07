import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ChallengeInsert } from "@/types/common";

export async function GET(request: Request) {
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

    // 사용자의 챌린지 목록 조회 (빵집 정보 포함)
    const { data: challenges, error } = await (supabase as any)
      .from("challenges")
      .select(
        `
        *,
        challenge_bakeries (
          id,
          bakery_id,
          order_num,
          visited_at,
          memo,
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 진행률 계산 및 평점 정보 추가
    const challengesWithProgress = challenges?.map((challenge: any) => {
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
            ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
              reviewCount
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
      return {
        ...challengeData,
        bakeries: bakeriesWithRating,
        total_count: totalCount,
        visited_count: visitedCount,
        progress_percentage: progressPercentage,
      };
    }) || [];

    return NextResponse.json({ challenges: challengesWithProgress });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, description, is_public } = body;

    // 챌린지 생성
    const challengeData: ChallengeInsert = {
      user_id: user.id,
      name: name || "나만의 빵지순례",
      description: description || null,
      is_public: is_public || false,
      is_active: true,
      share_token: null,
    };

    const { data, error } = await (supabase as any)
      .from("challenges")
      .insert(challengeData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ challenge: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
