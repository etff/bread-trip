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

    // 최근 리뷰 조회
    const { data: reviews } = await (supabase as any)
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        bakery:bakeries (
          id,
          name,
          image_url
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // 최근 찜한 빵집 조회
    const { data: favorites } = await (supabase as any)
      .from("favorites")
      .select(
        `
        id,
        created_at,
        bakery:bakeries (
          id,
          name,
          image_url
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // 활동을 하나의 배열로 합치기
    const activities = [
      ...(reviews?.map((review: any) => ({
        id: review.id,
        type: "review",
        bakery: review.bakery,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      })) || []),
      ...(favorites?.map((favorite: any) => ({
        id: favorite.id,
        type: "favorite",
        bakery: favorite.bakery,
        created_at: favorite.created_at,
      })) || []),
    ];

    // 최신순으로 정렬하고 상위 15개만 반환
    activities.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const recentActivities = activities.slice(0, 15);

    return NextResponse.json({ activities: recentActivities });
  } catch (error) {
    console.error("활동 내역 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
