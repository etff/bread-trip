import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ChallengeBakeryInsert } from "@/types/common";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: challengeId } = await params;
    const body = await request.json();
    const { bakery_id, order_num, memo } = body;

    // 필수 필드 검증
    if (!bakery_id) {
      return NextResponse.json(
        { error: "빵집 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 챌린지 소유권 확인
    const { data: challenge, error: challengeError } = await (supabase as any)
      .from("challenges")
      .select("id")
      .eq("id", challengeId)
      .eq("user_id", user.id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: "챌린지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 빵집이 존재하는지 확인
    const { data: bakery, error: bakeryError } = await (supabase as any)
      .from("bakeries")
      .select("id")
      .eq("id", bakery_id)
      .single();

    if (bakeryError || !bakery) {
      return NextResponse.json(
        { error: "빵집을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 챌린지에 빵집 추가
    const challengeBakeryData: ChallengeBakeryInsert = {
      challenge_id: challengeId,
      bakery_id,
      order_num: order_num || null,
      memo: memo || null,
      visited_at: null,
    };

    const { data, error } = await (supabase as any)
      .from("challenge_bakeries")
      .insert(challengeBakeryData)
      .select()
      .single();

    if (error) {
      // 중복 체크
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 챌린지에 추가된 빵집입니다." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ challenge_bakery: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
