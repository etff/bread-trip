import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Server Component/Server Action에서 사용하는 Supabase 클라이언트
 * 서버 환경에서만 실행되며, 쿠키를 통해 세션을 관리합니다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase 환경 변수가 설정되지 않았습니다.");
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "설정됨" : "누락됨");
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "설정됨" : "누락됨");
    throw new Error("Supabase configuration is missing");
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서 쿠키를 설정할 수 없는 경우 무시
          }
        },
      },
    }
  );
}
