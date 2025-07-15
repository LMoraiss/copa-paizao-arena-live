
import { cn } from '@/lib/utils';
import { Trophy, Users, Target, Medal, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navigationItems = [
  { name: 'Partidas', path: '/', icon: Calendar },
  { name: 'Classificação', path: '/standings', icon: Trophy },
  { name: 'Artilheiros', path: '/scorers', icon: Target },
  { name: 'Jogadores', path: '/players', icon: Users },
];

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center space-x-2 py-4 px-2 border-b-2 whitespace-nowrap text-sm font-medium transition-colors',
                  isActive
                    ? 'border-marista-dark-blue text-marista-dark-blue'
                    : 'border-transparent text-gray-500 hover:text-marista-dark-blue hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
