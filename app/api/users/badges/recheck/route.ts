import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkAndAwardBadges } from "@/lib/badges";

/**
 * 사용자의 배지를 재체크하여 누락된 배지를 부여합니다.
 */
export async function POST() {
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

    // 배지 재체크 실행
    const awardedBadges = await checkAndAwardBadges(user.id);

    return NextResponse.json({
      success: true,
      message: `${awardedBadges?.length || 0}개의 새로운 배지가 부여되었습니다.`,
      awardedBadgesCount: awardedBadges?.length || 0,
    });
  } catch (error) {
    console.error("배지 재체크 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
