
import React, { useState, useEffect } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Target, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TopScorer {
  id: string;
  playerName: string;
  teamName: string;
  goals: number;
  matches: number;
  position: number;
}

export const TopScorers = () => {
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopScorers();
  }, []);

  const fetchTopScorers = async () => {
    try {
      console.log('Fetching top scorers...');
      // For now, we'll use empty data since tables haven't been created yet
      setTopScorers([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching top scorers:', error);
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 bg-marista-dark-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {position}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-marista-dark-blue text-center">
          Artilheiros
        </h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (topScorers.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-marista-dark-blue text-center">
          Artilheiros
        </h1>
        <EmptyState
          icon={Target}
          title="Nenhum gol marcado ainda"
          description="A tabela de artilheiros será atualizada automaticamente conforme os gols forem marcados nas partidas."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-marista-dark-blue text-center">
        Artilheiros
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-marista-dark-blue" />
            <span>Ranking de Gols</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topScorers.map((scorer, index) => (
              <div 
                key={scorer.id} 
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  scorer.position <= 3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {getPositionIcon(scorer.position)}
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-marista-dark-blue rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{scorer.playerName}</h3>
                      <p className="text-sm text-gray-600">{scorer.teamName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-marista-dark-blue">
                      {scorer.goals}
                    </div>
                    <div className="text-sm text-gray-600">
                      {scorer.goals === 1 ? 'gol' : 'gols'}
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {scorer.matches} {scorer.matches === 1 ? 'jogo' : 'jogos'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="mt-6 p-4 bg-marista-gray rounded-lg">
            <h4 className="font-semibold text-marista-dark-blue mb-3">Estatísticas</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total de gols:</span>
                <span className="ml-2 font-semibold">
                  {topScorers.reduce((total, scorer) => total + scorer.goals, 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Artilheiro:</span>
                <span className="ml-2 font-semibold">
                  {topScorers[0]?.playerName || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Média por jogo:</span>
                <span className="ml-2 font-semibold">
                  {topScorers.length > 0 
                    ? (topScorers.reduce((total, scorer) => total + scorer.goals, 0) / 
                       topScorers.reduce((total, scorer) => total + scorer.matches, 0)).toFixed(1)
                    : '0.0'
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
