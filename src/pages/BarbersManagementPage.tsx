import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBarbers } from '@/hooks/useBarbers';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { BarbersList } from '@/components/dashboard/BarbersList';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function BarbersManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { barbers, loading, error } = useBarbers();

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewBarber = () => {
    // TODO: Implementar criação de novo barbeiro
    toast.info('Funcionalidade de criação de barbeiro será implementada em breve');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Erro ao carregar dados: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar 
        mobileMenuOpen={sidebarOpen} 
        onCloseMobileMenu={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          onMenuToggle={handleMenuToggle}
          profile={user}
          daysRemaining={30} // TODO: Implementar cálculo real
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToDashboard}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Button>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  Gerenciar Barbeiros
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie sua equipe de barbeiros e compartilhe links de agendamento
                </p>
              </div>

              <Button onClick={handleNewBarber} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Barbeiro
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total de Barbeiros
                    </p>
                    <p className="text-2xl font-bold">
                      {barbers?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-600"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ativos
                    </p>
                    <p className="text-2xl font-bold">
                      {barbers?.filter(b => b.status === 'active').length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Proprietários
                    </p>
                    <p className="text-2xl font-bold">
                      {barbers?.filter(b => b.type === 'owner').length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Barbers List */}
            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Lista de Barbeiros</h2>
                <p className="text-muted-foreground mt-1">
                  Clique no botão "Copiar Link" para compartilhar o link de agendamento com os clientes
                </p>
              </div>
              
              <div className="p-6">
                <BarbersList 
                  barbers={barbers || []}
                  onEditBarber={(id) => {
                    // TODO: Implementar edição
                    toast.info('Funcionalidade de edição será implementada em breve');
                  }}
                  onDeleteBarber={(id) => {
                    // TODO: Implementar exclusão
                    toast.info('Funcionalidade de exclusão será implementada em breve');
                  }}
                  onToggleStatus={(id) => {
                    // TODO: Implementar toggle de status
                    toast.info('Funcionalidade de alteração de status será implementada em breve');
                  }}
                  showActions={true}
                  showAddButton={false}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
