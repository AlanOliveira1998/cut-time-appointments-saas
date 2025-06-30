
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrialExpiredModal } from '../components/TrialExpiredModal';
import { ServicesList } from '../components/dashboard/ServicesList';
import { WorkingHoursList } from '../components/dashboard/WorkingHoursList';
import { AppointmentsList } from '../components/dashboard/AppointmentsList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scissors, Calendar, Settings, Clock, ExternalLink, User, LogOut, Crown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, isTrialExpired } = useAuth();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (user) {
      // Calcular dias restantes do trial
      const now = new Date();
      const createdDate = new Date(user.createdAt);
      const daysPassed = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = Math.max(0, 7 - daysPassed);
      setDaysRemaining(remaining);

      // Verificar se o trial expirou
      if (isTrialExpired()) {
        setShowTrialModal(true);
      }
    }
  }, [user, isTrialExpired]);

  if (!user) {
    return null;
  }

  const getPublicBookingUrl = () => {
    const barberSlug = user.name.toLowerCase().replace(/\s+/g, '-');
    return `${window.location.origin}/booking/${barberSlug}`;
  };

  const copyBookingUrl = () => {
    navigator.clipboard.writeText(getPublicBookingUrl());
  };

  const openBookingPage = () => {
    window.open(getPublicBookingUrl(), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00657C] to-[#004A5A] rounded-lg flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">BarberTime</h1>
              <p className="text-sm text-gray-600">Olá, {user.name}!</p>
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
              <span>Sua Página de Agendamento</span>
            </CardTitle>
            <CardDescription>
              Compartilhe este link com seus clientes para que eles possam agendar online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm font-mono">
                {getPublicBookingUrl()}
              </div>
              <Button onClick={copyBookingUrl} variant="outline">
                Copiar
              </Button>
              <Button onClick={openBookingPage} className="barber-button-primary">
                <ExternalLink className="w-4 h-4 mr-1" />
                Abrir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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

          <TabsContent value="profile">
            <Card className="barber-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#00657C]" />
                  <span>Informações do Perfil</span>
                </CardTitle>
                <CardDescription>
                  Suas informações cadastrais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-lg">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Telefone</label>
                    <p className="text-lg">{user.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Conta criada em</label>
                    <p className="text-lg">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Status da conta</h3>
                      <p className="text-sm text-gray-600">
                        {daysRemaining > 0 
                          ? `Período gratuito - ${daysRemaining} dias restantes`
                          : 'Período gratuito expirado'
                        }
                      </p>
                    </div>
                    {daysRemaining === 0 && (
                      <Button 
                        onClick={() => window.open('https://pay.kiwify.com.br/jhpskLr', '_blank')}
                        className="barber-button-primary"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Ativar Plano
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Trial Expired Modal */}
      <TrialExpiredModal 
        isOpen={showTrialModal} 
        onClose={() => setShowTrialModal(false)} 
      />
    </div>
  );
};

export default Dashboard;
