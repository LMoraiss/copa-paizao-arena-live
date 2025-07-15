
import { Trophy, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const AppHeader = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  return (
    <header className="bg-marista-dark-blue text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-marista-dark-blue" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Copa Paizão</h1>
            <p className="text-xs text-marista-light-blue">Colégio Marista</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdminDashboard}
              className="border-white text-white hover:bg-white hover:text-marista-dark-blue"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-marista-light-blue text-white">
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{profile?.full_name || 'Usuário'}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                  {isAdmin && (
                    <p className="text-xs text-marista-dark-blue font-medium">Administrador</p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
