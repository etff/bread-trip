import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Bakery } from "@/types/common";
import FavoritesContent from "./FavoritesContent";

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 찜한 빵집 목록 조회
  const { data: favorites } = await (supabase as any)
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
        image_url
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const bakeries = favorites
    ?.map((f: any) => f.bakery)
    .filter((b: any) => b !== null) as Bakery[] | undefined;

  return (
    <div className="min-h-screen bg-cream pb-20">
      <FavoritesContent bakeries={bakeries} />
    </div>
  );
}
