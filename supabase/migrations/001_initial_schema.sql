-- 🍞 빵지순례 데이터베이스 초기 스키마
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. Users 테이블 확장
-- Supabase Auth의 auth.users를 확장하는 public.users 테이블
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Users 테이블 RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users 정책: 모든 사람이 읽을 수 있음
CREATE POLICY "Users are viewable by everyone"
  ON public.users
  FOR SELECT
  USING (true);

-- Users 정책: 본인만 수정 가능
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 2. Bakeries 테이블
CREATE TABLE IF NOT EXISTS public.bakeries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  signature_bread TEXT,
  image_url TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Bakeries 테이블 인덱스
CREATE INDEX IF NOT EXISTS bakeries_lat_lng_idx ON public.bakeries (lat, lng);
CREATE INDEX IF NOT EXISTS bakeries_district_idx ON public.bakeries (district);
CREATE INDEX IF NOT EXISTS bakeries_created_by_idx ON public.bakeries (created_by);

-- Bakeries 테이블 RLS 활성화
ALTER TABLE public.bakeries ENABLE ROW LEVEL SECURITY;

-- Bakeries 정책: 모든 사람이 읽을 수 있음
CREATE POLICY "Bakeries are viewable by everyone"
  ON public.bakeries
  FOR SELECT
  USING (true);

-- Bakeries 정책: 로그인한 사용자만 등록 가능
CREATE POLICY "Authenticated users can insert bakeries"
  ON public.bakeries
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Bakeries 정책: 등록자만 수정 가능
CREATE POLICY "Users can update own bakeries"
  ON public.bakeries
  FOR UPDATE
  USING (auth.uid() = created_by);

-- 3. Reviews 테이블
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bakery_id UUID REFERENCES public.bakeries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reviews 테이블 인덱스
CREATE INDEX IF NOT EXISTS reviews_bakery_id_idx ON public.reviews (bakery_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews (created_at DESC);

-- Reviews 테이블 RLS 활성화
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews 정책: 모든 사람이 읽을 수 있음
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Reviews 정책: 로그인한 사용자만 작성 가능
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Reviews 정책: 작성자만 수정 가능
CREATE POLICY "Users can update own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Reviews 정책: 작성자만 삭제 가능
CREATE POLICY "Users can delete own reviews"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. 함수: 새로운 사용자 생성 시 public.users에 자동 추가
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: auth.users에 새 사용자가 생성되면 public.users에도 추가
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
