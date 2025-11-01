-- Create badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL, -- 'review_count', 'bakery_count', 'theme_visit', 'perfect_rating', etc.
  condition_value INTEGER, -- threshold value for the condition
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges join table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert sample badges
INSERT INTO badges (name, description, icon, condition_type, condition_value, color) VALUES
  ('첫 리뷰 작성', '첫 번째 리뷰를 작성했습니다', '🌟', 'review_count', 1, '#FFD700'),
  ('리뷰 작가', '리뷰 10개를 작성했습니다', '✍️', 'review_count', 10, '#4169E1'),
  ('리뷰 마스터', '리뷰 50개를 작성했습니다', '📝', 'review_count', 50, '#9370DB'),
  ('탐험가', '10곳의 빵집을 방문했습니다', '🗺️', 'bakery_count', 10, '#32CD32'),
  ('빵지순례자', '30곳의 빵집을 방문했습니다', '🎒', 'bakery_count', 30, '#FF6347'),
  ('크루아상 애호가', '크루아상 맛집 5곳을 방문했습니다', '🥐', 'theme_visit_croissant', 5, '#D2691E'),
  ('완벽주의자', '5점 만점 리뷰를 10개 작성했습니다', '⭐', 'perfect_rating', 10, '#FFD700');
