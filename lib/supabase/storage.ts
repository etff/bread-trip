import { createClient } from "./client";

/**
 * Supabase Storage에 이미지 업로드
 */
export async function uploadBakeryImage(file: File): Promise<string> {
  const supabase = createClient();

  // 파일 이름 생성 (중복 방지)
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const fileExt = file.name.split(".").pop();
  const fileName = `${timestamp}-${randomStr}.${fileExt}`;

  // bakery-images 버킷에 업로드
  const { data, error } = await supabase.storage
    .from("bakery-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // 공개 URL 가져오기
  const {
    data: { publicUrl },
  } = supabase.storage.from("bakery-images").getPublicUrl(data.path);

  return publicUrl;
}

/**
 * 이미지 삭제
 */
export async function deleteBakeryImage(url: string): Promise<void> {
  const supabase = createClient();

  // URL에서 파일 경로 추출
  const path = url.split("/").pop();
  if (!path) return;

  const { error } = await supabase.storage
    .from("bakery-images")
    .remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}
