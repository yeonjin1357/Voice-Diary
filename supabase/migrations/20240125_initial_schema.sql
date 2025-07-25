-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create emotions enum type
CREATE TYPE emotion_type AS ENUM ('기쁨', '슬픔', '불안', '분노', '평온', '기대', '놀람');

-- Create diary_entries table
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  audio_url TEXT,
  transcript TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create emotions table
CREATE TABLE emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diary_entry_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  type emotion_type NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create keywords table
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diary_entry_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX idx_diary_entries_date ON diary_entries(date);
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, date);
CREATE INDEX idx_emotions_diary_entry_id ON emotions(diary_entry_id);
CREATE INDEX idx_keywords_diary_entry_id ON keywords(diary_entry_id);

-- Create RLS policies
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- Diary entries policies
CREATE POLICY "Users can view their own diary entries" ON diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diary entries" ON diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries" ON diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries" ON diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Emotions policies
CREATE POLICY "Users can view emotions of their diary entries" ON emotions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diary_entries 
      WHERE diary_entries.id = emotions.diary_entry_id 
      AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert emotions for their diary entries" ON emotions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM diary_entries 
      WHERE diary_entries.id = emotions.diary_entry_id 
      AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update emotions of their diary entries" ON emotions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM diary_entries 
      WHERE diary_entries.id = emotions.diary_entry_id 
      AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete emotions of their diary entries" ON emotions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM diary_entries 
      WHERE diary_entries.id = emotions.diary_entry_id 
      AND diary_entries.user_id = auth.uid()
    )
  );

-- Keywords policies
CREATE POLICY "Users can view keywords of their diary entries" ON keywords
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diary_entries 
      WHERE diary_entries.id = keywords.diary_entry_id 
      AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert keywords for their diary entries" ON keywords
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM diary_entries 
      WHERE diary_entries.id = keywords.diary_entry_id 
      AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update keywords of their diary entries" ON keywords
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM diary_entries 
      WHERE diary_entries.id = keywords.diary_entry_id 
      AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete keywords of their diary entries" ON keywords
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM diary_entries 
      WHERE diary_entries.id = keywords.diary_entry_id 
      AND diary_entries.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for diary_entries
CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();