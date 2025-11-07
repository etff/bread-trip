import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 공유된 찜목록 조회
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    // 공유 토큰으로 찜목록 조회
    const { data: favoriteList, error: listError } = await (supabase as any)
      .from("favorite_lists")
      .select(`
        *,
        user:users!favorite_lists_user_id_fkey (
          id,
          nickname,
          profile_image_url
        )
      `)
      .eq("share_token", token)
      .single();

    if (listError || !favoriteList) {
      return NextResponse.json(
        { error: "찜목록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 찜목록의 빵집들 조회
    const { data: favorites, error: favoritesError } = await (supabase as any)
      .from("favorites")
      .select(`
        id,
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
          description
        )
      `)
      .eq("list_id", favoriteList.id)
      .order("created_at", { ascending: false });

    if (favoritesError) {
      console.error("찜한 빵집 조회 실패:", favoritesError);
      return NextResponse.json(
        { error: "찜한 빵집을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 각 빵집의 평점 계산
    const bakeryIds = favorites
      .map((f: any) => f.bakery?.id)
      .filter((id: any) => id);

    const { data: reviews } = await (supabase as any)
      .from("reviews")
      .select("bakery_id, rating")
      .in("bakery_id", bakeryIds);

    const ratingMap = new Map<string, { count: number; sum: number }>();
    reviews?.forEach((review: any) => {
      const current = ratingMap.get(review.bakery_id) || { count: 0, sum: 0 };
      ratingMap.set(review.bakery_id, {
        count: current.count + 1,
        sum: current.sum + review.rating,
      });
    });

    const bakeries = favorites
      .map((f: any) => {
        if (!f.bakery) return null;
        const ratings = ratingMap.get(f.bakery.id);
        return {
          ...f.bakery,
          review_count: ratings?.count || 0,
          average_rating: ratings
            ? Math.round((ratings.sum / ratings.count) * 10) / 10
            : 0,
        };
      })
      .filter((b: any) => b !== null);

    return NextResponse.json({
      favoriteList: {
        ...favoriteList,
        bakeries,
        bakery_count: bakeries.length,
      },
    });
  } catch (error) {
    console.error("공유된 찜목록 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
