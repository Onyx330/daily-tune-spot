-- Create table for storing Spotify user tokens
CREATE TABLE public.user_spotify_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_spotify_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for user_spotify_tokens
CREATE POLICY "Users can view their own tokens"
  ON public.user_spotify_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON public.user_spotify_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON public.user_spotify_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create table for daily recommendations
CREATE TABLE public.daily_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_image_url TEXT,
  preview_url TEXT,
  spotify_url TEXT NOT NULL,
  recommendation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for daily_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.daily_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations"
  ON public.daily_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_daily_recommendations_user_date ON public.daily_recommendations(user_id, recommendation_date);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_spotify_tokens_updated_at
  BEFORE UPDATE ON public.user_spotify_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();