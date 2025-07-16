
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Match {
  id: string;
  home_team: { name: string; logo_url?: string };
  away_team: { name: string; logo_url?: string };
  scheduled_at: string;
  venue: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  home_score: number;
  away_score: number;
}

export const Matches = () => {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name, logo_url),
          away_team:teams!matches_away_team_id_fkey(name, logo_url)
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return (data as Match[]) || [];
    },
  });

  const upcomingMatches = matches.filter(m => m.status === 'scheduled');
  const liveMatches = matches.filter(m => m.status === 'live');
  const finishedMatches = matches.filter(m => m.status === 'finished');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500 text-white">AO VIVO</Badge>;
      case 'finished':
        return <Badge variant="secondary">ENCERRADA</Badge>;
      default:
        return <Badge variant="outline">AGENDADA</Badge>;
    }
  };

  const MatchCard = ({ match }: { match: Match }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formatDate(match.scheduled_at)}</span>
          </div>
          {getStatusBadge(match.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 text-center">
            <div className="font-semibold text-lg">{match.home_team.name}</div>
          </div>
          
          <div className="mx-4 text-center">
            {match.status === 'finished' || match.status === 'live' ? (
              <div className="text-2xl font-bold text-marista-dark-blue">
                {match.home_score} - {match.away_score}
              </div>
            ) : (
              <div className="text-lg text-gray-500">vs</div>
            )}
          </div>
          
          <div className="flex-1 text-center">
            <div className="font-semibold text-lg">{match.away_team.name}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(match.scheduled_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{match.venue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando partidas...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {matches.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhuma partida agendada"
          description="As partidas da Copa Paizão aparecerão aqui quando forem criadas pelos administradores."
        />
      ) : (
        <div className="space-y-8">
          {liveMatches.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-marista-dark-blue mb-4">
                🔴 Partidas ao Vivo
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {liveMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {upcomingMatches.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-marista-dark-blue mb-4">
                📅 Próximas Partidas
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {finishedMatches.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-marista-dark-blue mb-4">
                ✅ Partidas Encerradas
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {finishedMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
