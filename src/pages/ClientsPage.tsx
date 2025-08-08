import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  created_at: string;
  total_appointments?: number;
  last_appointment?: string;
}

export const ClientsPage = () => {
  const navigate = useNavigate();
  const { user, isTrialExpired, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
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

  // Carregar clientes
  const loadClients = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar todos os agendamentos únicos por cliente
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          client_name,
          client_phone,
          client_email,
          created_at,
          appointment_date
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading clients:', error);
        return;
      }

      // Agrupar por cliente
      const clientsMap = new Map<string, Client>();
      
      appointments?.forEach(appointment => {
        const key = appointment.client_phone || appointment.client_email || appointment.client_name;
        
        if (!clientsMap.has(key)) {
          clientsMap.set(key, {
            id: key,
            name: appointment.client_name,
            phone: appointment.client_phone,
            email: appointment.client_email,
            created_at: appointment.created_at,
            total_appointments: 1,
            last_appointment: appointment.appointment_date
          });
        } else {
          const client = clientsMap.get(key)!;
          client.total_appointments = (client.total_appointments || 0) + 1;
          if (appointment.appointment_date > (client.last_appointment || '')) {
            client.last_appointment = appointment.appointment_date;
          }
        }
      });

      setClients(Array.from(clientsMap.values()));
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar clientes quando o componente montar
  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user, loadClients]);

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
    console.log('[ClientsPage] No authenticated user, redirecting to login');
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
                <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
                <p className="text-muted-foreground">
                  Gerencie os clientes da sua barbearia
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard/appointments')} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Agendamento
              </Button>
            </div>
            
            {/* Lista de clientes */}
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Carregando clientes...</div>
                </CardContent>
              </Card>
            ) : clients.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">Nenhum cliente encontrado</p>
                    <p className="text-sm text-gray-400">
                      Os clientes aparecerão aqui após fazerem agendamentos
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                  <Card key={client.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{client.name}</CardTitle>
                          <CardDescription>
                            {client.phone && <div>📞 {client.phone}</div>}
                            {client.email && <div>📧 {client.email}</div>}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {client.total_appointments} agendamento{client.total_appointments !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">
                        <p><strong>Primeiro agendamento:</strong> {new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
                        {client.last_appointment && (
                          <p><strong>Último agendamento:</strong> {new Date(client.last_appointment).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientsPage;
