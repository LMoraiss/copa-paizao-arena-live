import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Calendar, Users, Target, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">Copa Paizão</h1>
          <p className="text-xl text-muted-foreground">
            Acompanhe as partidas, estatísticas e classificação
          </p>
          
          {isAdmin && (
            <div className="mt-6">
              <Link to="/admin-dashboard">
                <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Settings className="w-5 h-5 mr-2" />
                  Painel Administrativo
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/matches">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Partidas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Veja todos os jogos programados e resultados
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/standings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Classificação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Tabela de classificação atualizada
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/players">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Jogadores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Conheça todos os jogadores participantes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/top-scorers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Artilheiros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Ranking dos maiores goleadores
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Welcome Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Bem-vindo à Copa Paizão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Acompanhe todas as emoções do torneio! Navegue pelos menus acima para ver
                partidas, classificação, jogadores e muito mais.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;