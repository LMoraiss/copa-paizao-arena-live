-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('goalkeeper', 'defender', 'midfielder', 'forward')),
  photo_url TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, jersey_number)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  stage TEXT NOT NULL CHECK (stage IN ('group_stage', 'semi_finals', 'final')),
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (home_team_id != away_team_id)
);

-- Create match_events table
CREATE TABLE public.match_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'yellow_card', 'red_card', 'substitution')),
  minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 120),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match_media table
CREATE TABLE public.match_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_media ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for teams
CREATE POLICY "Everyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Only admins can insert teams" ON public.teams FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update teams" ON public.teams FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete teams" ON public.teams FOR DELETE USING (public.is_admin());

-- RLS Policies for players
CREATE POLICY "Everyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Only admins can insert players" ON public.players FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update players" ON public.players FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete players" ON public.players FOR DELETE USING (public.is_admin());

-- RLS Policies for matches
CREATE POLICY "Everyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Only admins can insert matches" ON public.matches FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update matches" ON public.matches FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete matches" ON public.matches FOR DELETE USING (public.is_admin());

-- RLS Policies for match_events
CREATE POLICY "Everyone can view match events" ON public.match_events FOR SELECT USING (true);
CREATE POLICY "Only admins can insert match events" ON public.match_events FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update match events" ON public.match_events FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete match events" ON public.match_events FOR DELETE USING (public.is_admin());

-- RLS Policies for match_media
CREATE POLICY "Everyone can view match media" ON public.match_media FOR SELECT USING (true);
CREATE POLICY "Only admins can insert match media" ON public.match_media FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update match media" ON public.match_media FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete match media" ON public.match_media FOR DELETE USING (public.is_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();