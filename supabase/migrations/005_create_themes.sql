-- Create themes table
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bakery_themes join table
CREATE TABLE bakery_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bakery_id UUID NOT NULL REFERENCES bakeries(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bakery_id, theme_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_bakery_themes_bakery_id ON bakery_themes(bakery_id);
CREATE INDEX idx_bakery_themes_theme_id ON bakery_themes(theme_id);

-- Insert sample theme data
INSERT INTO themes (name, description, category, icon, color) VALUES
  ('크루아상 맛집', '바삭한 크루아상을 자랑하는 빵집', 'bread_type', '🥐', '#D2691E'),
  ('바게트 전문', '진짜 프랑스 스타일 바게트', 'bread_type', '🥖', '#8B4513'),
  ('식빵 맛집', '부드럽고 촉촉한 식빵', 'bread_type', '🍞', '#CD853F'),
  ('스콘 맛집', '영국식 스콘의 정석', 'bread_type', '🧁', '#DEB887'),
  ('카페형 베이커리', '빵과 커피를 함께 즐길 수 있는 곳', 'atmosphere', '☕', '#6F4E37'),
  ('테이크아웃 전문', '빠르게 포장해가기 좋은 곳', 'atmosphere', '🛍️', '#A0522D'),
  ('베이커리&카페', '넓은 공간에서 여유롭게', 'atmosphere', '🏠', '#8B7355'),
  ('비건 베이커리', '식물성 재료만 사용하는 빵집', 'special', '🌱', '#228B22'),
  ('글루텐프리', '글루텐 프리 빵 전문', 'special', '🌾', '#32CD32'),
  ('반려동물 동반', '강아지와 함께 갈 수 있는 빵집', 'special', '🐕', '#FF8C00');

-- Add RLS (Row Level Security) policies
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_themes ENABLE ROW LEVEL SECURITY;

-- Everyone can read themes
CREATE POLICY "Themes are viewable by everyone"
  ON themes FOR SELECT
  TO authenticated, anon
  USING (true);

-- Everyone can read bakery_themes
CREATE POLICY "Bakery themes are viewable by everyone"
  ON bakery_themes FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only authenticated users can insert bakery_themes
CREATE POLICY "Authenticated users can link themes to bakeries"
  ON bakery_themes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can delete their own bakery_themes
CREATE POLICY "Authenticated users can unlink themes from bakeries"
  ON bakery_themes FOR DELETE
  TO authenticated
  USING (true);
