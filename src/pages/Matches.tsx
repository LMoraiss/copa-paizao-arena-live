
import React, { useState, useEffect } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { EmptyState } from '@/components/EmptyState';
import { Calendar, Trophy, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  logo?: string;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  dateTime: Date;
  location: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  stage: string;
}

export const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const liveMatches = matches.filter(m => m.status === 'live');
  const finishedMatches = matches.filter(m => m.status === 'finished');

  useEffect(() => {
    fetchMatches();
    
    // Set up real-time subscription for live updates
    const channel = supabase
      .channel('matches-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMatches = async () => {
    try {
      console.log('Fetching matches...');
      // For now, we'll use empty data since tables haven't been created yet
      setMatches([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar partidas. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-marista-dark-blue mb-2">
            Copa Paizão 2024
          </h1>
          <p className="text-gray-600">Carregando partidas...</p>
        </div>
        <div className="grid gap-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-marista-dark-blue mb-2">
          Copa Paizão 2024
        </h1>
        <p className="text-gray-600">Acompanhe todas as partidas do torneio</p>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live" className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Ao Vivo ({liveMatches.length})</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Próximas ({upcomingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            Finalizadas ({finishedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {liveMatches.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Nenhuma partida ao vivo"
              description="No momento não há partidas sendo disputadas. Acompanhe as próximas partidas na aba correspondente."
            />
          ) : (
            <div className="grid gap-4">
              {liveMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMatches.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhuma partida agendada"
              description="Ainda não há partidas agendadas. Os administradores irão adicionar as partidas em breve."
            />
          ) : (
            <div className="grid gap-4">
              {upcomingMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finished" className="space-y-4">
          {finishedMatches.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nenhuma partida finalizada"
              description="Ainda não há partidas finalizadas. Os resultados aparecerão aqui após as partidas."
            />
          ) : (
            <div className="grid gap-4">
              {finishedMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
