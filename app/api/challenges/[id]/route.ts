import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
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

    const { id } = await params;

    // 챌린지 상세 조회 (빵집 정보 포함)
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
      .eq("id", id)
      .eq("user_id", user.id)
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

export async function PUT(
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

    const { id } = await params;
    const body = await request.json();
    const { name, description, is_active, is_public } = body;

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_public !== undefined) updateData.is_public = is_public;

    // 챌린지 수정
    const { data, error } = await (supabase as any)
      .from("challenges")
      .update(updateData)
      .eq("id", id)
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

    return NextResponse.json({ challenge: data });
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

    const { id } = await params;

    // 챌린지 삭제 (CASCADE로 연결된 challenge_bakeries도 자동 삭제됨)
    const { error } = await (supabase as any)
      .from("challenges")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "챌린지가 삭제되었습니다." });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
