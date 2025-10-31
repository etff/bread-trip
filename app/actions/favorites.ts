"use server";

import { createClient } from "@/lib/supabase/server";
import type { FavoriteInsert } from "@/types/common";

/**
 * 빵집 찜하기
 */
export async function addFavorite(bakeryId: string) {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 이미 찜했는지 확인
  const { data: existing } = await (supabase as any)
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("bakery_id", bakeryId)
    .single();

  if (existing) {
    return { error: "이미 찜한 빵집입니다." };
  }

  // 찜하기 추가
  const { error } = await (supabase as any)
    .from("favorites")
    .insert({
      user_id: user.id,
      bakery_id: bakeryId,
    });

  if (error) {
    console.error("찜하기 추가 오류:", error);
    return { error: "찜하기에 실패했습니다." };
  }

  return { success: true };
}

/**
 * 빵집 찜 취소
 */
export async function removeFavorite(bakeryId: string) {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 찜 취소
  const { error } = await (supabase as any)
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("bakery_id", bakeryId);

  if (error) {
    console.error("찜 취소 오류:", error);
    return { error: "찜 취소에 실패했습니다." };
  }

  return { success: true };
}

/**
 * 특정 빵집이 찜 되어있는지 확인
 */
export async function isFavorite(bakeryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isFavorite: false };
  }

  const { data } = await (supabase as any)
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("bakery_id", bakeryId)
    .single();

  return { isFavorite: !!data };
}

/**
 * 사용자의 찜한 빵집 목록 조회
 */
export async function getFavorites() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다.", data: [] };
  }

  const { data, error } = await (supabase as any)
    .from("favorites")
    .select(
      `
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
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("찜 목록 조회 오류:", error);
    return { error: "찜 목록을 불러오는데 실패했습니다.", data: [] };
  }

  return { data };
}
