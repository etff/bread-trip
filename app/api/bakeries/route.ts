import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { BakeryInsert } from "@/types/common";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "5000"; // 기본 5km
  const district = searchParams.get("district");
  const themeId = searchParams.get("theme");

  try {
    const supabase = await createClient();

    // 테마 필터가 있는 경우 bakery_themes를 통해 조회
    if (themeId) {
      const { data: bakeryThemes, error } = await (supabase as any)
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
            created_by,
            created_at
          )
        `
        )
        .eq("theme_id", themeId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      let bakeries = bakeryThemes
        ?.map((bt: any) => bt.bakery)
        .filter((b: any) => b !== null) || [];

      // 지역 필터 적용
      if (district && bakeries.length > 0) {
        bakeries = bakeries.filter((b: any) => b.district === district);
      }

      return NextResponse.json({ bakeries });
    }

    // 일반 빵집 목록 조회
    let query = supabase
      .from("bakeries")
      .select("*")
      .order("created_at", { ascending: false });

    // 지역 필터
    if (district) {
      query = query.eq("district", district);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: 좌표 기반 반경 검색은 PostGIS 필요 (추후 구현)
    // 현재는 전체 빵집 반환

    return NextResponse.json({ bakeries: data || [] });
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
    const { name, address, district, lat, lng, signature_bread, image_url } =
      body;

    // 필수 필드 검증
    if (!name || !address || !lat || !lng) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 빵집 등록
    const bakeryData: BakeryInsert = {
      name,
      address,
      district,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      signature_bread,
      image_url,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("bakeries")
      .insert(bakeryData as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bakery: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
