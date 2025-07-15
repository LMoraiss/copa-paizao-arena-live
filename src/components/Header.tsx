
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Target } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Partidas", icon: Calendar },
    { path: "/standings", label: "Classificação", icon: Trophy },
    { path: "/players", label: "Jogadores", icon: Users },
    { path: "/scorers", label: "Artilheiros", icon: Target },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Tournament Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-marista-dark-blue rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-marista-dark-blue">
                  Copa Paizão
                </h1>
                <p className="text-sm text-gray-600">Colégio Marista</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? "bg-marista-dark-blue hover:bg-marista-dark-blue/90" 
                        : "hover:bg-marista-gray"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Admin Access */}
          <div className="flex items-center space-x-4">
            <Badge 
              variant="outline" 
              className="hidden sm:flex border-marista-light-blue text-marista-light-blue"
            >
              AO VIVO
            </Badge>
            <Link to="/admin">
              <Button 
                variant="outline"
                className="border-marista-dark-blue text-marista-dark-blue hover:bg-marista-dark-blue hover:text-white"
              >
                Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                      isActive 
                        ? "text-marista-dark-blue bg-marista-gray" 
                        : "text-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
