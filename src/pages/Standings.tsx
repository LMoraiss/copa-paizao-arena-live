
import React, { useState, useEffect } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TeamStanding {
  id: string;
  name: string;
  logo?: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export const Standings = () => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      console.log('Fetching standings...');
      // For now, we'll use empty data since tables haven't been created yet
      setStandings([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching standings:', error);
      setLoading(false);
    }
  };

  const getPositionColor = (position: number) => {
    if (position <= 2) return 'bg-yellow-100 text-yellow-800'; // Champions/Classification
    if (position <= 4) return 'bg-blue-100 text-blue-800'; // Secondary positions
    if (position >= standings.length - 2) return 'bg-red-100 text-red-800'; // Relegation zone
    return 'bg-gray-100 text-gray-800'; // Middle table
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-marista-dark-blue text-center">
          Classificação
        </h1>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-marista-dark-blue text-center">
          Classificação
        </h1>
        <EmptyState
          icon={Trophy}
          title="Classificação ainda não disponível"
          description="A tabela de classificação será atualizada automaticamente conforme as partidas forem sendo disputadas."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-marista-dark-blue text-center">
        Classificação
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-marista-dark-blue" />
            <span>Tabela Geral</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">Pos</th>
                  <th className="text-left py-3 px-2">Time</th>
                  <th className="text-center py-3 px-2">J</th>
                  <th className="text-center py-3 px-2">V</th>
                  <th className="text-center py-3 px-2">E</th>
                  <th className="text-center py-3 px-2">D</th>
                  <th className="text-center py-3 px-2">GP</th>
                  <th className="text-center py-3 px-2">GC</th>
                  <th className="text-center py-3 px-2">SG</th>
                  <th className="text-center py-3 px-2 font-semibold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, index) => (
                  <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <Badge 
                        variant="secondary" 
                        className={getPositionColor(team.position)}
                      >
                        {team.position}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-marista-dark-blue rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">{team.matches}</td>
                    <td className="text-center py-3 px-2 text-green-600 font-medium">{team.wins}</td>
                    <td className="text-center py-3 px-2 text-yellow-600 font-medium">{team.draws}</td>
                    <td className="text-center py-3 px-2 text-red-600 font-medium">{team.losses}</td>
                    <td className="text-center py-3 px-2">{team.goalsFor}</td>
                    <td className="text-center py-3 px-2">{team.goalsAgainst}</td>
                    <td className="text-center py-3 px-2">
                      <span className={team.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2 font-bold text-marista-dark-blue">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span>1º-2º: Classificação direta</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span>3º-4º: Repescagem</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span>Últimos: Eliminação</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
