import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkAndAwardBadges } from "@/lib/badges";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 기존 리뷰 확인 (본인 리뷰인지 검증)
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingReview.user_id !== user.id) {
      return NextResponse.json(
        { error: "본인이 작성한 리뷰만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    // 리뷰 업데이트
    const body = await request.json();
    const { rating, comment, photo_url } = body;

    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (photo_url !== undefined) updateData.photo_url = photo_url;

    const { data, error } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 배지 획득 조건 확인 (비동기로 실행, 결과를 기다리지 않음)
    checkAndAwardBadges(user.id).catch((err) =>
      console.error("배지 확인 중 오류:", err)
    );

    return NextResponse.json({ review: data });
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
    const { id } = await params;
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

    // 기존 리뷰 확인 (본인 리뷰인지 검증)
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingReview.user_id !== user.id) {
      return NextResponse.json(
        { error: "본인이 작성한 리뷰만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 리뷰 삭제
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
