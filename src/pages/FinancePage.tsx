import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FinanceStats {
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  averageRevenuePerAppointment: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
}

export const FinancePage = () => {
  const navigate = useNavigate();
  const { user, isTrialExpired, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    averageRevenuePerAppointment: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fechar o menu móvel quando a rota mudar
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Alternar menu móvel
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Carregar estatísticas financeiras
  const loadFinanceStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar todos os agendamentos com serviços
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          status,
          appointment_date,
          services (
            price
          )
        `)
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error loading appointments:', error);
        return;
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      let totalRevenue = 0;
      let totalAppointments = 0;
      let completedAppointments = 0;
      let pendingAppointments = 0;
      let monthlyRevenue = 0;
      let weeklyRevenue = 0;

      appointments?.forEach(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        const servicePrice = appointment.services?.price || 0;
        
        totalAppointments++;
        totalRevenue += servicePrice;

        if (appointment.status === 'completed') {
          completedAppointments++;
        } else if (appointment.status === 'pending') {
          pendingAppointments++;
        }

        // Calcular receita mensal
        if (appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear) {
          monthlyRevenue += servicePrice;
        }

        // Calcular receita semanal
        if (appointmentDate >= oneWeekAgo) {
          weeklyRevenue += servicePrice;
        }
      });

      const averageRevenuePerAppointment = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

      setStats({
        totalRevenue,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        averageRevenuePerAppointment,
        monthlyRevenue,
        weeklyRevenue
      });
    } catch (error) {
      console.error('Error loading finance stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar estatísticas quando o componente montar
  useEffect(() => {
    if (user) {
      loadFinanceStats();
    }
  }, [user, loadFinanceStats]);

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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
    console.log('[FinancePage] No authenticated user, redirecting to login');
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
                <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
                <p className="text-muted-foreground">
                  Acompanhe as finanças da sua barbearia
                </p>
              </div>
            </div>
            
            {/* Estatísticas */}
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Carregando estatísticas...</div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Receita Total */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalAppointments} agendamento{stats.totalAppointments !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                {/* Receita Mensal */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      Este mês
                    </p>
                  </CardContent>
                </Card>

                {/* Receita Semanal */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Semanal</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(stats.weeklyRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      Últimos 7 dias
                    </p>
                  </CardContent>
                </Card>

                {/* Média por Agendamento */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Média por Agendamento</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(stats.averageRevenuePerAppointment)}</div>
                    <p className="text-xs text-muted-foreground">
                      Valor médio
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Detalhes dos Agendamentos */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Agendamentos</CardTitle>
                  <CardDescription>
                    Distribuição por status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Completados</Badge>
                      </div>
                      <span className="font-medium">{stats.completedAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Pendentes</Badge>
                      </div>
                      <span className="font-medium">{stats.pendingAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Total</Badge>
                      </div>
                      <span className="font-medium">{stats.totalAppointments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                  <CardDescription>
                    Visão geral das finanças
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Receita Total</span>
                      <span className="font-bold">{formatPrice(stats.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Receita Mensal</span>
                      <span className="font-bold">{formatPrice(stats.monthlyRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Receita Semanal</span>
                      <span className="font-bold">{formatPrice(stats.weeklyRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Média por Agendamento</span>
                      <span className="font-bold">{formatPrice(stats.averageRevenuePerAppointment)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinancePage;
