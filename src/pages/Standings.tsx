
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
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

export const Standings = () => {
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando classificação...</div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Trophy}
          title="Classificação ainda não disponível"
          description="A tabela de classificação aparecerá aqui após o início das partidas da Copa Paizão."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-marista-dark-blue mb-8">
        Classificação Geral
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-marista-dark-blue" />
            <span>Tabela de Classificação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead className="text-center">PTS</TableHead>
                <TableHead className="text-center">J</TableHead>
                <TableHead className="text-center">V</TableHead>
                <TableHead className="text-center">E</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">GP</TableHead>
                <TableHead className="text-center">GC</TableHead>
                <TableHead className="text-center">SG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
