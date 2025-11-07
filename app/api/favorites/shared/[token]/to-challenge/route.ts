import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 공유된 찜목록을 내 챌린지로 복사
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 공유 토큰으로 찜목록 조회
    const { data: favoriteList, error: listError } = await (supabase as any)
      .from("favorite_lists")
      .select(`
        *,
        user:users!favorite_lists_user_id_fkey (
          nickname
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
      .select("bakery_id")
      .eq("list_id", favoriteList.id)
      .order("created_at", { ascending: true });

    if (favoritesError) {
      console.error("찜한 빵집 조회 실패:", favoritesError);
      return NextResponse.json(
        { error: "찜한 빵집을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    if (!favorites || favorites.length === 0) {
      return NextResponse.json(
        { error: "찜목록에 빵집이 없습니다." },
        { status: 400 }
      );
    }

    // 새 챌린지 생성
    const challengeName = `${favoriteList.user?.nickname || "누군가"}님의 ${favoriteList.name}`;
    const challengeDescription = favoriteList.description || `${favoriteList.user?.nickname || "누군가"}님이 공유한 찜목록입니다.`;

    const { data: challenge, error: challengeError } = await (supabase as any)
      .from("challenges")
      .insert({
        user_id: user.id,
        name: challengeName,
        description: challengeDescription,
        is_public: false,
      })
      .select()
      .single();

    if (challengeError || !challenge) {
      console.error("챌린지 생성 실패:", challengeError);
      return NextResponse.json(
        { error: "챌린지 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    // 챌린지에 빵집들 추가
    const challengeBakeries = favorites.map((f: any, index: number) => ({
      challenge_id: challenge.id,
      bakery_id: f.bakery_id,
      order_num: index + 1,
    }));

    const { error: bakeriesError } = await (supabase as any)
      .from("challenge_bakeries")
      .insert(challengeBakeries);

    if (bakeriesError) {
      console.error("챌린지 빵집 추가 실패:", bakeriesError);
      // 챌린지 롤백
      await (supabase as any)
        .from("challenges")
        .delete()
        .eq("id", challenge.id);
      return NextResponse.json(
        { error: "챌린지에 빵집을 추가하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error("찜목록 복사 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
