
-- Create enums for various status types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.match_status AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'cancelled');
CREATE TYPE public.player_position AS ENUM ('goalkeeper', 'defender', 'midfielder', 'forward');
CREATE TYPE public.event_type AS ENUM ('goal', 'yellow_card', 'red_card', 'substitution', 'own_goal');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role app_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  founded_year INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  position player_position NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT,
  goals INTEGER DEFAULT 0 NOT NULL,
  yellow_cards INTEGER DEFAULT 0 NOT NULL,
  red_cards INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(team_id, jersey_number)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status match_status DEFAULT 'scheduled' NOT NULL,
  home_score INTEGER DEFAULT 0 NOT NULL,
  away_score INTEGER DEFAULT 0 NOT NULL,
  venue TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CHECK (home_team_id != away_team_id)
);

-- Create match events table
CREATE TABLE public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  event_type event_type NOT NULL,
  minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 120),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create match media table for photos/videos
CREATE TABLE public.match_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for teams (public read, admin write)
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage teams" ON public.teams FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for players (public read, admin write)
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage players" ON public.players FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for matches (public read, admin write)
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage matches" ON public.matches FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for match events (public read, admin write)
CREATE POLICY "Anyone can view match events" ON public.match_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage match events" ON public.match_events FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for match media (public read, admin write)
CREATE POLICY "Anyone can view match media" ON public.match_media FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage match media" ON public.match_media FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'user'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update player goals when match events are added
CREATE OR REPLACE FUNCTION public.update_player_goals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.event_type = 'goal' THEN
    UPDATE public.players 
    SET goals = goals + 1 
    WHERE id = NEW.player_id;
  ELSIF NEW.event_type = 'own_goal' THEN
    UPDATE public.players 
    SET goals = goals + 1 
    WHERE id = NEW.player_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to update player stats on match events
CREATE OR REPLACE TRIGGER on_match_event_insert
  AFTER INSERT ON public.match_events
  FOR EACH ROW EXECUTE FUNCTION public.update_player_goals();

-- Enable realtime for live updates
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.match_events REPLICA IDENTITY FULL;
ALTER TABLE public.players REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;

-- Insert some sample data for testing
INSERT INTO public.teams (name, logo_url, description) VALUES
  ('Equipe A', null, 'Primeira equipe da Copa Paizão'),
  ('Equipe B', null, 'Segunda equipe da Copa Paizão'),
  ('Equipe C', null, 'Terceira equipe da Copa Paizão'),
  ('Equipe D', null, 'Quarta equipe da Copa Paizão');

-- Insert sample players
WITH team_data AS (
  SELECT id, name FROM public.teams LIMIT 4
)
INSERT INTO public.players (name, jersey_number, position, team_id) 
SELECT 
  'Jogador ' || generate_series(1, 5),
  generate_series(1, 5),
  CASE 
    WHEN generate_series(1, 5) = 1 THEN 'goalkeeper'::player_position
    WHEN generate_series(1, 5) <= 3 THEN 'defender'::player_position
    WHEN generate_series(1, 5) = 4 THEN 'midfielder'::player_position
    ELSE 'forward'::player_position
  END,
  team_data.id
FROM team_data, generate_series(1, 5);

-- Insert sample matches
WITH teams AS (
  SELECT id, name, ROW_NUMBER() OVER (ORDER BY name) as rn FROM public.teams LIMIT 4
)
INSERT INTO public.matches (home_team_id, away_team_id, scheduled_at, venue)
SELECT 
  t1.id,
  t2.id,
  now() + interval '1 day' * generate_series(1, 3),
  'Campo Central'
FROM teams t1, teams t2
WHERE t1.rn < t2.rn
LIMIT 6;
