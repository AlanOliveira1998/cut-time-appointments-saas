
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrialExpiredModal } from '../components/TrialExpiredModal';
import { ServicesList } from '../components/dashboard/ServicesList';
import { WorkingHoursList } from '../components/dashboard/WorkingHoursList';
import { BarbersList } from '../components/dashboard/BarbersList';
import { AppointmentsList } from '../components/dashboard/AppointmentsList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scissors, Calendar, Settings, Clock, ExternalLink, User, LogOut, Crown, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '../integrations/supabase/client';

const Dashboard: React.FC = () => {
  const { user, logout, isTrialExpired, loading } = useAuth();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
      calculateTrialDays();
      
      // Verificar se o trial expirou
      if (isTrialExpired()) {
        console.log('Trial expirado - exibindo modal');
        setShowTrialModal(true);
      }
    }
  }, [user, isTrialExpired]);

  // Verificação adicional para garantir que o modal seja exibido
  useEffect(() => {
    if (user && !loading) {
      const trialExpired = isTrialExpired();
      if (trialExpired && !showTrialModal) {
        console.log('Trial expirado detectado - exibindo modal');
        setShowTrialModal(true);
      }
    }
  }, [user, loading, isTrialExpired, showTrialModal]);

  const loadProfile = async () => {
    if (!user) return;

    try {
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
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const calculateTrialDays = () => {
    if (!user?.created_at) return;

    const now = new Date();
    const createdDate = new Date(user.created_at);
    const daysPassed = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, 7 - daysPassed);
    setDaysRemaining(remaining);
  };

  const handleTrialModalClose = () => {
    // Não permitir fechar o modal se o trial expirou
    if (isTrialExpired()) {
      // Redirecionar para a página de compra
      window.open('https://kiwify.app/PYxzlNE', '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#00657C] rounded-lg flex items-center justify-center animate-pulse">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getPublicBookingUrl = () => {
    // Agora direciona para a página geral de agendamento onde o cliente pode escolher qualquer barbeiro
    return `${window.location.origin}/booking`;
  };

  const copyBookingUrl = () => {
    navigator.clipboard.writeText(getPublicBookingUrl());
  };

  const openBookingPage = () => {
    window.open(getPublicBookingUrl(), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trial Expired Modal */}
      <TrialExpiredModal 
        isOpen={showTrialModal} 
        onClose={handleTrialModalClose}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="BarberTime Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">BarberTime</h1>
              <p className="text-sm text-gray-600">Olá, {profile?.name || user.email}!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Trial Status */}
            <div className="flex items-center space-x-2">
              {daysRemaining > 0 ? (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{daysRemaining} dias restantes</span>
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>Trial expirado</span>
                </Badge>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Public Booking Link Card */}
        <Card className="barber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="w-5 h-5 text-[#00657C]" />
              <span>Links de Agendamento</span>
            </CardTitle>
            <CardDescription>
              Compartilhe estes links com seus clientes para agendamentos online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Link Geral */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Link Geral (Escolha de Barbeiro)</h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm font-mono">
                  {getPublicBookingUrl()}
                </div>
                <Button onClick={copyBookingUrl} variant="outline" size="sm">
                  Copiar
                </Button>
                <Button onClick={openBookingPage} className="barber-button-primary" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Abrir
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Permite que o cliente escolha qualquer barbeiro disponível
              </p>
            </div>

            {/* Link Específico do Dono */}
            {profile?.name && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Seu Link Pessoal</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm font-mono">
                    {`${window.location.origin}/booking/${profile.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()}`}
                  </div>
                  <Button 
                    onClick={() => {
                      const url = `${window.location.origin}/booking/${profile.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()}`;
                      navigator.clipboard.writeText(url);
                      toast({
                        title: "Link copiado!",
                        description: "Seu link pessoal foi copiado para a área de transferência",
                      });
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    Copiar
                  </Button>
                  <Button 
                    onClick={() => {
                      const url = `${window.location.origin}/booking/${profile.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()}`;
                      window.open(url, '_blank');
                    }} 
                    className="barber-button-primary" 
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Abrir
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Direciona diretamente para agendamentos com você
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="agenda" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <Scissors className="w-4 h-4" />
              <span>Serviços</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Horários</span>
            </TabsTrigger>
            <TabsTrigger value="barbers" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Barbeiros</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agenda">
            <AppointmentsList />
          </TabsContent>

          <TabsContent value="services">
            <ServicesList />
          </TabsContent>

          <TabsContent value="hours">
            <WorkingHoursList />
          </TabsContent>

          <TabsContent value="barbers">
            <BarbersList />
          </TabsContent>

          <TabsContent value="profile">
            <Card className="barber-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#00657C]" />
                  <span>Informações do Perfil</span>
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <p className="text-gray-900">{profile?.name || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <p className="text-gray-900">{profile?.phone || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status da Conta
                    </label>
                    <div className="flex items-center space-x-2">
                      {daysRemaining > 0 ? (
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{daysRemaining} dias restantes do trial</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Trial expirado - Ative seu plano</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
