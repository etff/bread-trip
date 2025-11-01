-- Add practical information fields to bakeries table
ALTER TABLE bakeries
  ADD COLUMN phone TEXT,
  ADD COLUMN hours TEXT,
  ADD COLUMN parking_available BOOLEAN DEFAULT false,
  ADD COLUMN wifi_available BOOLEAN DEFAULT false,
  ADD COLUMN pet_friendly BOOLEAN DEFAULT false,
  ADD COLUMN website_url TEXT,
  ADD COLUMN instagram_url TEXT,
  ADD COLUMN price_range TEXT, -- '저렴', '보통', '비쌈'
  ADD COLUMN closed_days TEXT; -- '매주 월요일', '명절' 등
