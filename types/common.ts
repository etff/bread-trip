import type { Database } from "./database";

/**
 * 공통 타입 정의
 */

// 테이블 Row 타입 추출
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Bakery = Database["public"]["Tables"]["bakeries"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];

// Insert 타입
export type BakeryInsert = Database["public"]["Tables"]["bakeries"]["Insert"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
export type FavoriteInsert = Database["public"]["Tables"]["favorites"]["Insert"];

// 확장된 타입 (Join 포함)
export type BakeryWithReviews = Bakery & {
  reviews: Review[];
  review_count?: number;
  average_rating?: number;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "nickname" | "profile_image_url">;
};

export type ReviewWithBakery = Review & {
  bakery: Pick<Bakery, "id" | "name" | "image_url">;
};

// 좌표 타입
export type Coordinates = {
  lat: number;
  lng: number;
};

// 지역 타입 (서울 주요 지역)
export type District =
  | "성수"
  | "망원"
  | "홍대"
  | "연남"
  | "이태원"
  | "경리단길"
  | "한남"
  | "강남"
  | "신사"
  | "압구정"
  | "성북"
  | "부암"
  | "기타";
