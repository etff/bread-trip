import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

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

    // 챌린지 소유권 확인
    const { data: challenge, error: challengeError } = await (supabase as any)
      .from("challenges")
      .select("*")
      .eq("id", challengeId)
      .eq("user_id", user.id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: "챌린지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미 공유 토큰이 있으면 재사용
    if (challenge.share_token && challenge.is_public) {
      return NextResponse.json({
        share_token: challenge.share_token,
        share_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/challenges/shared/${challenge.share_token}`,
      });
    }

    // 새로운 공유 토큰 생성 (8자리 랜덤 문자열)
    const shareToken = randomBytes(4).toString("hex");

    // 챌린지를 공개로 설정하고 토큰 저장
    const { data, error } = await (supabase as any)
      .from("challenges")
      .update({
        is_public: true,
        share_token: shareToken,
      })
      .eq("id", challengeId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      share_token: shareToken,
      share_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/challenges/shared/${shareToken}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // 공유 해제 (is_public을 false로, share_token 유지)
    const { data, error } = await (supabase as any)
      .from("challenges")
      .update({
        is_public: false,
      })
      .eq("id", challengeId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "챌린지를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "공유가 해제되었습니다." });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
