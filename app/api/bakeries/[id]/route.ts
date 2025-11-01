import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 빵집 정보 조회 (리뷰 정보 포함)
    const { data, error } = await supabase
      .from("bakeries")
      .select(`
        *,
        reviews(rating)
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // 평균 평점 계산
    const reviews = (data as any).reviews || [];
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount
      : 0;

    const { reviews: _, ...bakeryData } = data as any;

    // 빵집에 연결된 테마 조회
    const { data: bakeryThemes } = await (supabase as any)
      .from("bakery_themes")
      .select(
        `
        theme:themes (
          id,
          name,
          category,
          icon,
          color
        )
      `
      )
      .eq("bakery_id", id);

    const themes = bakeryThemes
      ?.map((bt: any) => bt.theme)
      .filter((t: any) => t !== null) || [];

    return NextResponse.json({
      bakery: {
        ...bakeryData,
        review_count: reviewCount,
        average_rating: Math.round(averageRating * 10) / 10,
        themes
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
