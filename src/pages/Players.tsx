
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
  goals: number;
  photo_url?: string;
  team: { name: string };
}

export const Players = () => {
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('players')
        .select(`
          *,
          team:teams(name)
        `)
        .order('name');

      if (error) throw error;
      return (data as Player[]) || [];
    },
  });

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'goalkeeper':
        return 'bg-yellow-100 text-yellow-800';
      case 'defender':
        return 'bg-blue-100 text-blue-800';
      case 'midfielder':
        return 'bg-green-100 text-green-800';
      case 'forward':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionName = (position: string) => {
    switch (position) {
      case 'goalkeeper':
        return 'Goleiro';
      case 'defender':
        return 'Defensor';
      case 'midfielder':
        return 'Meio-campo';
      case 'forward':
        return 'Atacante';
      default:
        return position;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando jogadores...</div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Users}
          title="Nenhum jogador cadastrado"
          description="Os jogadores da Copa Paizão aparecerão aqui quando forem cadastrados pelos administradores."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-marista-dark-blue mb-8">
        Jogadores da Copa
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {players.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-marista-light-blue rounded-full flex items-center justify-center mb-2">
                {player.photo_url ? (
                  <img
                    src={player.photo_url}
                    alt={player.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <CardTitle className="text-lg">{player.name}</CardTitle>
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline" className="font-bold">
                  #{player.jersey_number}
                </Badge>
                <Badge className={getPositionColor(player.position)}>
                  {getPositionName(player.position)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Equipe:</span>
                  <p className="font-medium text-marista-dark-blue">{player.team.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Gols:</span>
                  <p className="text-2xl font-bold text-marista-dark-blue">{player.goals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
