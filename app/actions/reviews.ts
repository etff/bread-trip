"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteReview(reviewId: string) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "로그인이 필요합니다." };
    }

    // 본인 리뷰인지 확인
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", reviewId)
      .single();

    if (fetchError || !existingReview) {
      return { error: "리뷰를 찾을 수 없습니다." };
    }

    if (existingReview.user_id !== user.id) {
      return { error: "본인이 작성한 리뷰만 삭제할 수 있습니다." };
    }

    // 리뷰 삭제
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { error: "서버 오류가 발생했습니다." };
  }
}

export async function updateReview(
  reviewId: string,
  data: {
    rating?: number;
    comment?: string;
    photo_url?: string;
  }
) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "로그인이 필요합니다." };
    }

    // 본인 리뷰인지 확인
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", reviewId)
      .single();

    if (fetchError || !existingReview) {
      return { error: "리뷰를 찾을 수 없습니다." };
    }

    if (existingReview.user_id !== user.id) {
      return { error: "본인이 작성한 리뷰만 수정할 수 있습니다." };
    }

    // 리뷰 업데이트
    const updateData: any = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.photo_url !== undefined) updateData.photo_url = data.photo_url;

    const { data: updatedReview, error } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: true, review: updatedReview };
  } catch (error) {
    return { error: "서버 오류가 발생했습니다." };
  }
}
