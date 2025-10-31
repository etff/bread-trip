-- 빵집 소개 필드 추가
ALTER TABLE public.bakeries
ADD COLUMN IF NOT EXISTS description TEXT;

-- 기존 데이터에 대한 기본값 설정 (선택사항)
COMMENT ON COLUMN public.bakeries.description IS '빵집 소개 및 설명';
