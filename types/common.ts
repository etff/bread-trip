import type { Database } from "./database";

/**
 * 공통 타입 정의
 */

// 테이블 Row 타입 추출
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Bakery = Database["public"]["Tables"]["bakeries"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type Theme = Database["public"]["Tables"]["themes"]["Row"];
export type BakeryTheme = Database["public"]["Tables"]["bakery_themes"]["Row"];

// Insert 타입
export type BakeryInsert = Database["public"]["Tables"]["bakeries"]["Insert"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
export type FavoriteInsert = Database["public"]["Tables"]["favorites"]["Insert"];
export type ThemeInsert = Database["public"]["Tables"]["themes"]["Insert"];
export type BakeryThemeInsert = Database["public"]["Tables"]["bakery_themes"]["Insert"];

// 확장된 타입 (Join 포함)
export type BakeryWithReviews = Bakery & {
  reviews: Review[];
  review_count?: number;
  average_rating?: number;
};

export type BakeryWithRating = Bakery & {
  review_count?: number;
  average_rating?: number;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "nickname" | "profile_image_url">;
};

export type ReviewWithBakery = Review & {
  bakery: Pick<Bakery, "id" | "name" | "image_url">;
};

export type BakeryWithThemes = Bakery & {
  themes: Theme[];
  review_count?: number;
  average_rating?: number;
};

export type ThemeWithBakeries = Theme & {
  bakeries: Bakery[];
  bakery_count?: number;
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

// 테마 카테고리 타입
export type ThemeCategory = "bread_type" | "atmosphere" | "special";

// 챌린지 관련 타입
export type Challenge = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
};

export type ChallengeBakery = {
  id: string;
  challenge_id: string;
  bakery_id: string;
  order_num: number | null;
  visited_at: string | null;
  memo: string | null;
  created_at: string;
};

// Insert 타입
export type ChallengeInsert = Omit<Challenge, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ChallengeBakeryInsert = Omit<ChallengeBakery, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

// 확장된 타입
export type ChallengeWithBakeries = Challenge & {
  bakeries: (ChallengeBakery & {
    bakery: BakeryWithRating;
  })[];
  total_count?: number;
  visited_count?: number;
  progress_percentage?: number;
};

export type ChallengeBakeryWithBakery = ChallengeBakery & {
  bakery: BakeryWithRating;
};

export type ChallengeStats = {
  total_count: number;
  visited_count: number;
  progress_percentage: number;
};
