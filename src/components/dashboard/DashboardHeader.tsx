import { Button } from '@/components/ui/button';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  onMenuToggle: () => void;
  profile?: any;
  daysRemaining: number;
}

export const DashboardHeader = ({
  onMenuToggle,
  profile,
  daysRemaining
}: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="relative ml-auto flex-1 md:grow-0">
        <div className="flex items-center justify-end gap-4">
          {/* Não mostrar aviso de dias restantes para alan.pires.oliveira@gmail.com */}
          {daysRemaining <= 3 && daysRemaining > 0 && daysRemaining !== 999 && user?.email !== 'alan.pires.oliveira@gmail.com' && (
            <Badge variant="warning" className="hidden sm:flex">
              {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes no período de teste
            </Badge>
          )}
          
          <Button variant="outline" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificações</span>
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
              onClick={handleLogout}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
