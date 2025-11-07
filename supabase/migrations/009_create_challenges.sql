-- Create challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '나만의 빵지순례',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false, -- 공유 여부
  share_token TEXT UNIQUE, -- 공유용 토큰
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge_bakeries join table
CREATE TABLE challenge_bakeries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  bakery_id UUID NOT NULL REFERENCES bakeries(id) ON DELETE CASCADE,
  order_num INTEGER, -- 순서
  visited_at TIMESTAMP WITH TIME ZONE, -- 방문 완료 시간
  memo TEXT, -- 메모
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, bakery_id)
);

-- Create indexes
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenges_share_token ON challenges(share_token);
CREATE INDEX idx_challenges_is_active ON challenges(is_active);
CREATE INDEX idx_challenge_bakeries_challenge_id ON challenge_bakeries(challenge_id);
CREATE INDEX idx_challenge_bakeries_bakery_id ON challenge_bakeries(bakery_id);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_bakeries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Users can view their own challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public challenges"
  ON challenges FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

CREATE POLICY "Users can insert their own challenges"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges"
  ON challenges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for challenge_bakeries
CREATE POLICY "Users can view their own challenge bakeries"
  ON challenge_bakeries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_bakeries.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public challenge bakeries"
  ON challenge_bakeries FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_bakeries.challenge_id
      AND challenges.is_public = true
    )
  );

CREATE POLICY "Users can insert bakeries to their own challenges"
  ON challenge_bakeries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_bakeries.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update bakeries in their own challenges"
  ON challenge_bakeries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_bakeries.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bakeries from their own challenges"
  ON challenge_bakeries FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_bakeries.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
