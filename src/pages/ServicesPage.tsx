import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ServicesList } from '@/components/dashboard/ServicesList';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

export const ServicesPage = () => {
  const navigate = useNavigate();
  const { user, isTrialExpired, loading: authLoading } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fechar o menu móvel quando a rota mudar
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Alternar menu móvel
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Navegar para a página de novo serviço
  const handleNewService = () => {
    // O ServicesList já tem o modal integrado, então não precisamos navegar
    // Apenas fechar o menu móvel se estiver aberto
    closeMobileMenu();
  };

  // Mostrar loading enquanto autenticação está sendo verificada
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não houver usuário autenticado, redirecionar para login
  if (!user) {
    console.log('[ServicesPage] No authenticated user, redirecting to login');
    setTimeout(() => navigate('/auth'), 0);
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Se o trial tiver expirado, mostrar mensagem (exceto para alan.pires.oliveira@gmail.com)
  if (isTrialExpired && user?.email !== 'alan.pires.oliveira@gmail.com') {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Período de teste expirado</h1>
          <p className="text-muted-foreground">
            Seu período de teste expirou. Entre em contato com o suporte para continuar usando o BarberTime.
          </p>
          <Button onClick={() => navigate('/auth')}>Voltar para o login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar 
        mobileMenuOpen={mobileMenuOpen} 
        onCloseMobileMenu={closeMobileMenu} 
      />
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <DashboardHeader 
          onToggleMobileMenu={toggleMobileMenu}
          mobileMenuOpen={mobileMenuOpen}
          daysRemaining={0}
        />
        
        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Cabeçalho da página */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
                <p className="text-muted-foreground">
                  Gerencie os serviços oferecidos pela sua barbearia
                </p>
              </div>
              <Button onClick={handleNewService} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Serviço
              </Button>
            </div>
            
            {/* Lista de serviços */}
            <ServicesList />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServicesPage;
