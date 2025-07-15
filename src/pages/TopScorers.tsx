
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const TopScorers = () => {
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['top-scorers'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('players')
          .select(`
            *,
            team:teams(name)
          `)
          .gt('goals', 0)
          .order('goals', { ascending: false })
          .limit(20);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.log('Top scorers fetch error (expected if schema not created):', error);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando artilheiros...</div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Target}
          title="Ainda não há artilheiros"
          description="A lista dos maiores goleadores da Copa Paizão aparecerá aqui após os primeiros gols."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-marista-dark-blue mb-8">
        Artilheiros da Copa
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-marista-dark-blue" />
            <span>Top Goleadores</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Jogador</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead className="text-center">Gols</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player: any, index: number) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{index + 1}</span>
                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.team?.name}</TableCell>
                  <TableCell className="capitalize">{player.position}</TableCell>
                  <TableCell className="text-center font-bold text-marista-dark-blue">
                    {player.goals}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
