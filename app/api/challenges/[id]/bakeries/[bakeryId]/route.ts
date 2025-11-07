import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; bakeryId: string }> }
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

    const { id: challengeId, bakeryId } = await params;

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

    // 챌린지에서 빵집 제거
    const { error } = await (supabase as any)
      .from("challenge_bakeries")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("bakery_id", bakeryId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "챌린지에서 빵집이 제거되었습니다." });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; bakeryId: string }> }
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

    const { id: challengeId, bakeryId } = await params;
    const body = await request.json();
    const { visited, memo } = body;

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

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (visited !== undefined) {
      updateData.visited_at = visited ? new Date().toISOString() : null;
    }
    if (memo !== undefined) {
      updateData.memo = memo;
    }

    // 방문 상태 또는 메모 업데이트
    const { data, error } = await (supabase as any)
      .from("challenge_bakeries")
      .update(updateData)
      .eq("challenge_id", challengeId)
      .eq("bakery_id", bakeryId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "챌린지에 해당 빵집이 없습니다." },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ challenge_bakery: data });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
