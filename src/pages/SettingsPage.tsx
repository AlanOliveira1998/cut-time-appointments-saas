import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, User, Bell, Shield, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  phone?: string;
  subscription_status: string;
  created_at: string;
}

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isTrialExpired, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  // Fechar o menu móvel quando a rota mudar
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Alternar menu móvel
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Carregar perfil do usuário
  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Salvar perfil
  const saveProfile = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      // Recarregar perfil
      await loadProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Carregar perfil quando o componente montar
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

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
    console.log('[SettingsPage] No authenticated user, redirecting to login');
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Cabeçalho da página */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">
                  Gerencie as configurações da sua conta e barbearia
                </p>
              </div>
            </div>
            
            {/* Configurações */}
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Carregando configurações...</div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {/* Perfil */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-primary" />
                      <CardTitle>Perfil</CardTitle>
                    </div>
                    <CardDescription>
                      Atualize suas informações pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                    <Button onClick={saveProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Alterações'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Conta */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle>Conta</CardTitle>
                    </div>
                    <CardDescription>
                      Informações da sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="outline">Não editável</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Status da Assinatura</p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.subscription_status === 'trial' ? 'Período de Teste' : 'Ativa'}
                        </p>
                      </div>
                      <Badge variant={profile?.subscription_status === 'trial' ? 'secondary' : 'default'}>
                        {profile?.subscription_status === 'trial' ? 'Trial' : 'Ativa'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data de Criação</p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notificações */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-primary" />
                      <CardTitle>Notificações</CardTitle>
                    </div>
                    <CardDescription>
                      Configure suas preferências de notificação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações por Email</p>
                        <p className="text-sm text-muted-foreground">
                          Receber notificações por email sobre novos agendamentos
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Lembretes de Agendamento</p>
                        <p className="text-sm text-muted-foreground">
                          Receber lembretes sobre agendamentos próximos
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                {/* Assinatura */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <CardTitle>Assinatura</CardTitle>
                    </div>
                    <CardDescription>
                      Gerencie sua assinatura
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Plano Atual</p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.subscription_status === 'trial' ? 'Período de Teste (7 dias)' : 'Plano Premium'}
                        </p>
                      </div>
                      <Badge variant={profile?.subscription_status === 'trial' ? 'secondary' : 'default'}>
                        {profile?.subscription_status === 'trial' ? 'Trial' : 'Premium'}
                      </Badge>
                    </div>
                    {profile?.subscription_status === 'trial' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Período de Teste:</strong> Você está usando a versão gratuita do BarberTime. 
                          Para continuar usando após o período de teste, entre em contato conosco.
                        </p>
                      </div>
                    )}
                    <Button variant="outline" className="w-full">
                      Gerenciar Assinatura
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
