import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 테마 정보 조회
    const { data: theme, error: themeError } = await supabase
      .from("themes")
      .select("*")
      .eq("id", id)
      .single();

    if (themeError) {
      return NextResponse.json(
        { error: "테마를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 테마에 연결된 빵집 목록 조회
    const { data: bakeryThemes, error: bakeryError } = await (
      supabase as any
    )
      .from("bakery_themes")
      .select(
        `
        bakery:bakeries (
          id,
          name,
          address,
          district,
          lat,
          lng,
          signature_bread,
          description,
          image_url,
          created_at
        )
      `
      )
      .eq("theme_id", id);

    if (bakeryError) {
      return NextResponse.json(
        { error: bakeryError.message },
        { status: 500 }
      );
    }

    const bakeries = bakeryThemes
      ?.map((bt: any) => bt.bakery)
      .filter((b: any) => b !== null) || [];

    return NextResponse.json({
      theme: {
        ...(theme as any),
        bakeries,
        bakery_count: bakeries.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
