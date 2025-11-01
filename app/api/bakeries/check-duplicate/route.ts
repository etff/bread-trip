import { createClient } from "@/lib/supabase/server";
import { calculateDistance } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

type BakeryRow = Database["public"]["Tables"]["bakeries"]["Row"];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    // 파라미터 검증
    if (!name && (!lat || !lng)) {
      return NextResponse.json(
        { error: "이름 또는 좌표를 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const duplicates: {
      id: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
      distance?: number;
      matchReason: "same_name" | "nearby";
    }[] = [];

    // 1. 이름으로 중복 체크
    if (name && name.trim()) {
      const { data: nameMatches, error: nameError } = await (supabase as any)
        .from("bakeries")
        .select("id, name, address, lat, lng")
        .ilike("name", name.trim());

      if (nameError) {
        console.error("Name check error:", nameError);
      } else if (nameMatches && nameMatches.length > 0) {
        nameMatches.forEach((bakery: any) => {
          duplicates.push({
            id: bakery.id,
            name: bakery.name,
            address: bakery.address,
            lat: bakery.lat,
            lng: bakery.lng,
            matchReason: "same_name",
          });
        });
      }
    }

    // 2. 좌표로 근처 빵집 체크 (100m 반경)
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: "올바른 좌표를 입력해주세요." },
          { status: 400 }
        );
      }

      // 모든 빵집 가져오기 (추후 PostGIS로 최적화 가능)
      const { data: allBakeries, error: locationError } = await (supabase as any)
        .from("bakeries")
        .select("id, name, address, lat, lng");

      if (locationError) {
        console.error("Location check error:", locationError);
      } else if (allBakeries && allBakeries.length > 0) {
        allBakeries.forEach((bakery: any) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            bakery.lat,
            bakery.lng
          );

          // 100m 이내에 있는 빵집
          if (distance <= 100) {
            // 이미 이름으로 매칭된 빵집은 제외
            const alreadyAdded = duplicates.some(
              (dup) => dup.id === bakery.id
            );

            if (!alreadyAdded) {
              duplicates.push({
                id: bakery.id,
                name: bakery.name,
                address: bakery.address,
                lat: bakery.lat,
                lng: bakery.lng,
                distance: Math.round(distance),
                matchReason: "nearby",
              });
            } else {
              // 이름 매칭에도 걸렸고 거리도 가까우면 거리 정보 추가
              const existingDup = duplicates.find(
                (dup) => dup.id === bakery.id
              );
              if (existingDup) {
                existingDup.distance = Math.round(distance);
              }
            }
          }
        });
      }
    }

    // 결과 반환
    return NextResponse.json({
      hasDuplicates: duplicates.length > 0,
      duplicates,
      count: duplicates.length,
    });
  } catch (error) {
    console.error("Duplicate check error:", error);
    return NextResponse.json(
      { error: "중복 체크 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
