-- 찜목록 공유를 위한 테이블 생성
CREATE TABLE IF NOT EXISTS favorite_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '나의 찜목록',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 찜목록 자동 생성을 위한 트리거
CREATE OR REPLACE FUNCTION create_default_favorite_list()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO favorite_lists (user_id, name, is_public)
  VALUES (NEW.id, '나의 찜목록', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- favorites 테이블에 list_id 추가 (기본 찜목록에 연결)
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES favorite_lists(id) ON DELETE CASCADE;

-- 기존 favorites를 각 사용자의 기본 찜목록에 연결
DO $$
DECLARE
  user_record RECORD;
  default_list_id UUID;
BEGIN
  FOR user_record IN
    SELECT DISTINCT user_id FROM favorites WHERE list_id IS NULL
  LOOP
    -- 해당 유저의 기본 찜목록 찾기 또는 생성
    SELECT id INTO default_list_id
    FROM favorite_lists
    WHERE user_id = user_record.user_id
    LIMIT 1;

    IF default_list_id IS NULL THEN
      INSERT INTO favorite_lists (user_id, name, is_public)
      VALUES (user_record.user_id, '나의 찜목록', false)
      RETURNING id INTO default_list_id;
    END IF;

    -- 해당 유저의 favorites를 기본 찜목록에 연결
    UPDATE favorites
    SET list_id = default_list_id
    WHERE user_id = user_record.user_id AND list_id IS NULL;
  END LOOP;
END $$;

-- RLS 정책
ALTER TABLE favorite_lists ENABLE ROW LEVEL SECURITY;

-- 자신의 찜목록은 모두 볼 수 있음
CREATE POLICY "Users can view own favorite lists"
  ON favorite_lists FOR SELECT
  USING (auth.uid() = user_id);

-- 공개된 찜목록은 누구나 볼 수 있음
CREATE POLICY "Public favorite lists are viewable by everyone"
  ON favorite_lists FOR SELECT
  USING (is_public = true);

-- share_token으로 공유된 찜목록은 누구나 볼 수 있음
CREATE POLICY "Shared favorite lists are viewable by token"
  ON favorite_lists FOR SELECT
  USING (share_token IS NOT NULL);

-- 자신의 찜목록만 생성 가능
CREATE POLICY "Users can create own favorite lists"
  ON favorite_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 자신의 찜목록만 수정 가능
CREATE POLICY "Users can update own favorite lists"
  ON favorite_lists FOR UPDATE
  USING (auth.uid() = user_id);

-- 자신의 찜목록만 삭제 가능
CREATE POLICY "Users can delete own favorite lists"
  ON favorite_lists FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_favorite_lists_user_id ON favorite_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_lists_share_token ON favorite_lists(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_favorites_list_id ON favorites(list_id);
