"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(email: string, password: string, nickname: string) {
  const supabase = await createClient();

  // 1. 회원가입
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // 2. users 테이블에 프로필 생성
  if (authData.user) {
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        nickname,
      } as any);

    if (profileError) {
      console.error("프로필 생성 실패:", profileError);
    }
  }

  return { success: true };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signInWithEmail(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // users 테이블에서 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    ...user,
    nickname: profile?.nickname,
    profile_image_url: profile?.profile_image_url,
  };
}
