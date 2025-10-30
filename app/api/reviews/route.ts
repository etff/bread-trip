import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ReviewInsert } from "@/types/common";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bakeryId = searchParams.get("bakeryId");
  const userId = searchParams.get("userId");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const supabase = await createClient();

    let query = supabase
      .from("reviews")
      .select(
        `
        *,
        user:users!reviews_user_id_fkey(id, nickname, profile_image_url),
        bakery:bakeries!reviews_bakery_id_fkey(id, name, image_url)
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 특정 빵집의 리뷰만 조회
    if (bakeryId) {
      query = query.eq("bakery_id", bakeryId);
    }

    // 특정 사용자의 리뷰만 조회
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
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
    const { bakery_id, rating, comment, photo_url } = body;

    // 필수 필드 검증
    if (!bakery_id || !rating) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 평점 유효성 검사
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "평점은 1~5 사이여야 합니다." },
        { status: 400 }
      );
    }

    // 리뷰 등록
    const reviewData: ReviewInsert = {
      bakery_id,
      user_id: user.id,
      rating: parseInt(rating),
      comment,
      photo_url,
    };

    const { data, error } = await supabase
      .from("reviews")
      .insert(reviewData as any)
      .select(
        `
        *,
        user:users!reviews_user_id_fkey(id, nickname, profile_image_url),
        bakery:bakeries!reviews_bakery_id_fkey(id, name, image_url)
      `
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
