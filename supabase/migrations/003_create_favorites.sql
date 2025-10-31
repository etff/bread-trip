-- 🍞 찜하기 기능을 위한 Favorites 테이블 생성

-- Favorites 테이블
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  bakery_id UUID REFERENCES public.bakeries(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- 사용자당 빵집 하나씩만 찜하기 가능하도록 유니크 제약조건
  UNIQUE(user_id, bakery_id)
);

-- Favorites 테이블 인덱스
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS favorites_bakery_id_idx ON public.favorites (bakery_id);
CREATE INDEX IF NOT EXISTS favorites_created_at_idx ON public.favorites (created_at DESC);

-- Favorites 테이블 RLS 활성화
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites 정책: 본인의 찜 목록만 조회 가능
CREATE POLICY "Users can view own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Favorites 정책: 로그인한 사용자만 찜하기 가능
CREATE POLICY "Authenticated users can insert favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Favorites 정책: 본인의 찜만 삭제 가능
CREATE POLICY "Users can delete own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);
