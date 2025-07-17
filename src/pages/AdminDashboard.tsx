
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Calendar, Target, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateTeamForm } from '@/components/forms/CreateTeamForm';
import { CreatePlayerForm } from '@/components/forms/CreatePlayerForm';
import { CreateMatchForm } from '@/components/forms/CreateMatchForm';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);

  const handleFormSuccess = () => {
    // Close dialogs and potentially refresh data
    setTeamDialogOpen(false);
    setPlayerDialogOpen(false);
    setMatchDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-marista-dark-blue mb-2">
          Painel Administrativo
        </h1>
        <p className="text-gray-600">
          Gerencie equipes, jogadores, partidas e eventos da Copa Paizão
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-marista-dark-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Equipes</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-marista-light-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jogadores</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-marista-dark-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partidas</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-marista-light-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gols</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="teams">Equipes</TabsTrigger>
              <TabsTrigger value="players">Jogadores</TabsTrigger>
              <TabsTrigger value="matches">Partidas</TabsTrigger>
              <TabsTrigger value="events">Eventos</TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Gerenciar Equipes</h3>
                <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-marista-dark-blue hover:bg-marista-dark-blue/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Equipe
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Equipe</DialogTitle>
                    </DialogHeader>
                    <CreateTeamForm 
                      onSuccess={handleFormSuccess}
                      onCancel={() => setTeamDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-center py-8 text-gray-500">
                Nenhuma equipe cadastrada ainda.
              </div>
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Gerenciar Jogadores</h3>
                <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-marista-dark-blue hover:bg-marista-dark-blue/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Jogador
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Jogador</DialogTitle>
                    </DialogHeader>
                    <CreatePlayerForm 
                      onSuccess={handleFormSuccess}
                      onCancel={() => setPlayerDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-center py-8 text-gray-500">
                Nenhum jogador cadastrado ainda.
              </div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Gerenciar Partidas</h3>
                <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-marista-dark-blue hover:bg-marista-dark-blue/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Partida
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Partida</DialogTitle>
                    </DialogHeader>
                    <CreateMatchForm 
                      onSuccess={handleFormSuccess}
                      onCancel={() => setMatchDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-center py-8 text-gray-500">
                Nenhuma partida agendada ainda.
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Eventos ao Vivo</h3>
              </div>
              <div className="text-center py-8 text-gray-500">
                Nenhuma partida ao vivo no momento.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
