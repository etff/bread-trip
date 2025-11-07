import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * 찜목록 공유 링크 조회/생성
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 사용자의 기본 찜목록 조회
    const { data: favoriteList } = await (supabase as any)
      .from("favorite_lists")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!favoriteList) {
      return NextResponse.json(
        { error: "찜목록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ favoriteList });
  } catch (error) {
    console.error("찜목록 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 찜목록 공유 링크 생성
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 사용자의 기본 찜목록 조회
    const { data: favoriteList } = await (supabase as any)
      .from("favorite_lists")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!favoriteList) {
      return NextResponse.json(
        { error: "찜목록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미 share_token이 있으면 반환
    if (favoriteList.share_token) {
      return NextResponse.json({ favoriteList });
    }

    // 새로운 공유 토큰 생성
    const shareToken = crypto.randomBytes(8).toString("hex");

    // 찜목록 업데이트
    const { data: updatedList, error } = await (supabase as any)
      .from("favorite_lists")
      .update({ share_token: shareToken })
      .eq("id", favoriteList.id)
      .select()
      .single();

    if (error) {
      console.error("공유 링크 생성 실패:", error);
      return NextResponse.json(
        { error: "공유 링크 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ favoriteList: updatedList });
  } catch (error) {
    console.error("공유 링크 생성 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 찜목록 공유 링크 삭제
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 사용자의 기본 찜목록 조회
    const { data: favoriteList } = await (supabase as any)
      .from("favorite_lists")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!favoriteList) {
      return NextResponse.json(
        { error: "찜목록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 공유 토큰 삭제
    const { error } = await (supabase as any)
      .from("favorite_lists")
      .update({ share_token: null })
      .eq("id", favoriteList.id);

    if (error) {
      console.error("공유 링크 삭제 실패:", error);
      return NextResponse.json(
        { error: "공유 링크 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("공유 링크 삭제 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
