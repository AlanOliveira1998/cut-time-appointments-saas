import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { DashboardAppointments } from '@/components/dashboard/DashboardAppointments';
import { ProfileDebug } from '@/components/debug/ProfileDebug';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Plus } from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isTrialExpired, loading: authLoading } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Using the custom hook to manage dashboard data
  const {
    profile,
    stats,
    loading: dataLoading,
    error,
    daysRemaining,
    refreshData
  } = useDashboardData();

  // Fechar o menu móvel quando a rota mudar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  // Navegar para a página de novo agendamento
  const handleNewAppointment = () => {
    navigate('/appointments/new');
  };

  // Visualizar detalhes do agendamento
  const handleViewAppointment = (id: string) => {
    navigate(`/appointments/${id}`);
  };

  // Alternar menu móvel
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Fechar menu móvel
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

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

  // Mostrar loading enquanto os dados estão sendo carregados
  if (dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  // If there's an error loading the data
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-md space-y-4 text-center">
          <h2 className="text-xl font-semibold">Erro ao carregar o dashboard</h2>
          <p className="text-muted-foreground">
            {error.includes('Perfil do usuário não encontrado') 
              ? 'Configurando seu perfil... Por favor, aguarde um momento.'
              : error || 'Ocorreu um erro inesperado'
            }
          </p>
          <Button onClick={refreshData} variant="outline">
            Tentar novamente
          </Button>
          
          {/* Debug component for profile issues */}
          <div className="mt-8">
            <ProfileDebug />
          </div>
          
          {/* Test button to force refresh */}
          <div className="mt-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Se não houver usuário autenticado, redirecionar para login
  if (!user) {
    console.log('[DashboardPage] No authenticated user, redirecting to login');
    // Usar setTimeout para evitar erros de atualização de estado durante a renderização
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

  // Se o trial tiver expirado, mostrar mensagem
  if (isTrialExpired) {
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
          daysRemaining={daysRemaining}
        />
        
        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Cabeçalho da página */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
                <p className="text-muted-foreground">
                  Bem-vindo de volta, {profile?.name || 'usuário'}!
                </p>
              </div>
              <Button onClick={handleNewAppointment} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Agendamento
              </Button>
            </div>
            
            {/* Cartões de visão geral */}
            <DashboardOverview 
              stats={{
                totalAppointments: stats?.totalAppointments || 0,
                pendingAppointments: stats?.pendingAppointments || 0,
                totalRevenue: stats?.totalRevenue || 0,
                averageServiceTime: stats?.averageServiceTime || '0 min',
              }} 
              loading={dataLoading}
            />
            
            {/* Recent appointments */}
            <DashboardAppointments 
              appointments={stats?.recentAppointments || []}
              loading={dataLoading}
              onViewAppointment={handleViewAppointment}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
