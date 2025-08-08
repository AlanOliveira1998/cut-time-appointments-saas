import { Button } from '@/components/ui/button';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  onToggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

export const DashboardHeader = ({
  onToggleMobileMenu,
  mobileMenuOpen
}: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onToggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 ml-2 lg:ml-0">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:block">{user?.email}</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};
