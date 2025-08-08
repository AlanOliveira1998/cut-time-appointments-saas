import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Calendar, Scissors, Users, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const sidebarItems = [
  {
    title: 'Visão Geral',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Agendamentos',
    href: '/dashboard/appointments',
    icon: Calendar,
  },
  {
    title: 'Barbeiros',
    href: '/dashboard/barbeiros',
    icon: Users,
  },
  {
    title: 'Serviços',
    href: '/dashboard/services',
    icon: Scissors,
  },
  {
    title: 'Clientes',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    title: 'Financeiro',
    href: '/dashboard/finance',
    icon: DollarSign,
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  className?: string;
  mobileMenuOpen: boolean;
  onCloseMobileMenu?: () => void;
}

export const DashboardSidebar = ({
  className,
  mobileMenuOpen,
  onCloseMobileMenu,
}: DashboardSidebarProps) => {
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform duration-300 ease-in-out lg:translate-x-0',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:relative lg:inset-0 lg:z-0',
        className
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">BarberTime</h1>
        </div>
        
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onCloseMobileMenu}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground',
                    )}
                    aria-hidden="true"
                  />
                  {item.title}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-md p-2 text-sm font-medium text-muted-foreground">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">U</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">Usuário</p>
              <p className="truncate text-xs text-muted-foreground">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
