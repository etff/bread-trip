import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Heart, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Bakery } from "@/types/common";

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
      {/* Header */}
      <div className="bg-white border-b border-cream sticky top-0 z-40">
        <div className="max-w-screen-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="p-2 -ml-2 hover:bg-cream rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <h1 className="text-2xl font-bold text-brown">찜한 빵집</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-md mx-auto px-4 py-6">
        {!bakeries || bakeries.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              아직 찜한 빵집이 없어요
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              마음에 드는 빵집을 찜해보세요!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-brown text-white rounded-lg hover:bg-brown/90 transition-colors font-medium"
            >
              빵집 탐험하기
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bakeries.map((bakery) => (
              <Link
                key={bakery.id}
                href={`/bakeries/${bakery.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-cream rounded-lg overflow-hidden">
                    {bakery.image_url ? (
                      <img
                        src={bakery.image_url}
                        alt={bakery.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🍞
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-brown mb-1 truncate">
                      {bakery.name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {bakery.district || "서울"}
                      </span>
                    </div>
                    {bakery.signature_bread && (
                      <p className="text-sm text-gray-500 truncate">
                        {bakery.signature_bread}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
