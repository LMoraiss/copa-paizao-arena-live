
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users } from 'lucide-react';
import { format, isAfter, isBefore, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const now = new Date();
  const matchTime = new Date(match.dateTime);
  
  const getStatusBadge = () => {
    switch (match.status) {
      case 'live':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white live-indicator">
            AO VIVO
          </Badge>
        );
      case 'finished':
        return (
          <Badge variant="secondary">
            ENCERRADO
          </Badge>
        );
      default:
        const minutesUntilMatch = differenceInMinutes(matchTime, now);
        if (minutesUntilMatch > 0 && minutesUntilMatch <= 60) {
          return (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
              EM {minutesUntilMatch} MIN
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="border-marista-light-blue text-marista-light-blue">
            AGENDADO
          </Badge>
        );
    }
  };

  const getTimeDisplay = () => {
    if (match.status === 'live') {
      return "AO VIVO";
    }
    if (match.status === 'finished') {
      return "FINAL";
    }
    return format(matchTime, "HH:mm", { locale: ptBR });
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        match.status === 'live' ? 'ring-2 ring-red-500 ring-opacity-50' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {format(matchTime, "dd/MM/yyyy", { locale: ptBR })} • {match.stage}
          </div>
          {getStatusBadge()}
        </div>

        {/* Teams and Score */}
        <div className="space-y-4">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-marista-dark-blue rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">{match.homeTeam.name}</span>
            </div>
            {match.status !== 'upcoming' && (
              <span className="text-2xl font-bold text-marista-dark-blue">
                {match.homeScore ?? 0}
              </span>
            )}
          </div>

          {/* VS and Time */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">VS</div>
            <div className="text-lg font-semibold text-marista-dark-blue">
              {getTimeDisplay()}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-marista-light-blue rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">{match.awayTeam.name}</span>
            </div>
            {match.status !== 'upcoming' && (
              <span className="text-2xl font-bold text-marista-dark-blue">
                {match.awayScore ?? 0}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {match.location}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
