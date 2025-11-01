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

    // 모든 배지 조회
    const { data: allBadges, error: badgesError } = await supabase
      .from("badges")
      .select("*")
      .order("created_at");

    if (badgesError) {
      throw badgesError;
    }

    // 사용자가 획득한 배지 조회
    const { data: userBadges, error: userBadgesError } = await supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", user.id);

    if (userBadgesError) {
      throw userBadgesError;
    }

    // 배지 정보와 획득 정보 병합
    const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || []);
    const earnedBadgesMap = new Map(
      userBadges?.map((ub) => [ub.badge_id, ub.earned_at]) || []
    );

    const badges = allBadges?.map((badge) => ({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
      earnedAt: earnedBadgesMap.get(badge.id) || null,
    }));

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("배지 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
