
import React, { useState, useEffect } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Users, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  teamName: string;
  photo?: string;
  goals?: number;
  matches?: number;
}

export const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = players.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers(players);
    }
  }, [searchTerm, players]);

  const fetchPlayers = async () => {
    try {
      console.log('Fetching players...');
      // For now, we'll use empty data since tables haven't been created yet
      setPlayers([]);
      setFilteredPlayers([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching players:', error);
      setLoading(false);
    }
  };

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'goleiro':
        return 'bg-yellow-100 text-yellow-800';
      case 'zagueiro':
        return 'bg-blue-100 text-blue-800';
      case 'meio-campo':
        return 'bg-green-100 text-green-800';
      case 'atacante':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-marista-dark-blue text-center">
          Jogadores
        </h1>
        <div className="animate-pulse grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-marista-dark-blue mb-2">
          Jogadores
        </h1>
        <p className="text-gray-600">Conheça todos os atletas da Copa Paizão</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por jogador, time ou posição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredPlayers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchTerm ? "Nenhum jogador encontrado" : "Nenhum jogador cadastrado"}
          description={
            searchTerm 
              ? "Tente ajustar os termos da busca para encontrar jogadores."
              : "Os jogadores serão adicionados pelos administradores em breve."
          }
        />
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4">
            {filteredPlayers.length} {filteredPlayers.length === 1 ? 'jogador encontrado' : 'jogadores encontrados'}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlayers.map((player) => (
              <Card key={player.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-marista-dark-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {player.jerseyNumber}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-600">{player.teamName}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary" className={getPositionColor(player.position)}>
                          {player.position}
                        </Badge>
                        {player.goals && player.goals > 0 && (
                          <Badge variant="outline" className="text-marista-dark-blue">
                            {player.goals} {player.goals === 1 ? 'gol' : 'gols'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
