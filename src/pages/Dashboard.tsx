
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
import { Scissors, Calendar, Settings, Clock, ExternalLink, User, LogOut, Crown, Users, Menu, X, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout, isTrialExpired, loading } = useAuth();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tab, setTab] = useState('home'); // Começa na Home

  const navigate = useNavigate();

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
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-xl flex items-center justify-center animate-pulse">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getPublicBookingUrl = () => {
    return `${window.location.origin}/booking`;
  };

  const copyBookingUrl = () => {
    navigator.clipboard.writeText(getPublicBookingUrl());
    toast({
      title: "Link copiado!",
      description: "O link de agendamento foi copiado para a área de transferência",
    });
  };

  const openBookingPage = () => {
    window.open(getPublicBookingUrl(), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar fixa */}
      <nav className="barber-header w-full fixed top-0 left-0 z-50 shadow-sm">
        <div className="barber-container flex items-center justify-between h-16">
          {/* Logo (opcional) */}
          <div className="flex items-center gap-2">
            {/* <img src='/logo.jpg' alt='Logo' className='w-8 h-8 rounded-full' /> */}
          </div>
          {/* Menu desktop */}
          <ul className="hidden md:flex items-center gap-6 text-gray-800 font-medium text-base">
            <li><button onClick={()=>setTab('home')} className={tab==='home'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Home className="w-5 h-5"/>Home</button></li>
            <li><button onClick={()=>setTab('appointments')} className={tab==='appointments'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Calendar className="w-5 h-5"/>Agenda</button></li>
            <li><button onClick={()=>setTab('services')} className={tab==='services'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Scissors className="w-5 h-5"/>Serviços</button></li>
            <li><button onClick={()=>setTab('hours')} className={tab==='hours'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Clock className="w-5 h-5"/>Horários</button></li>
            <li><button onClick={()=>setTab('barbers')} className={tab==='barbers'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Users className="w-5 h-5"/>Barbeiros</button></li>
            <li><button onClick={logout} className="flex items-center gap-1 text-red-600"><LogOut className="w-5 h-5"/>Sair</button></li>
          </ul>
          {/* Menu mobile */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
            </Button>
          </div>
        </div>
        {/* Dropdown mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 top-16 z-50 animate-fade-in-up">
            <ul className="flex flex-col gap-2 p-4 text-gray-800 font-medium">
              <li><button onClick={()=>{setTab('home');setMobileMenuOpen(false);}} className={tab==='home'?'text-primary flex items-center gap-2':'flex items-center gap-2'}><Home className="w-5 h-5"/>Home</button></li>
              <li><button onClick={()=>{setTab('appointments');setMobileMenuOpen(false);}} className={tab==='appointments'?'text-primary flex items-center gap-2':'flex items-center gap-2'}><Calendar className="w-5 h-5"/>Agenda</button></li>
              <li><button onClick={()=>{setTab('services');setMobileMenuOpen(false);}} className={tab==='services'?'text-primary flex items-center gap-2':'flex items-center gap-2'}><Scissors className="w-5 h-5"/>Serviços</button></li>
              <li><button onClick={()=>{setTab('hours');setMobileMenuOpen(false);}} className={tab==='hours'?'text-primary flex items-center gap-2':'flex items-center gap-2'}><Clock className="w-5 h-5"/>Horários</button></li>
              <li><button onClick={()=>{setTab('barbers');setMobileMenuOpen(false);}} className={tab==='barbers'?'text-primary flex items-center gap-2':'flex items-center gap-2'}><Users className="w-5 h-5"/>Barbeiros</button></li>
              <li><button onClick={()=>{setMobileMenuOpen(false);logout();}} className="flex items-center gap-2 text-red-600"><LogOut className="w-5 h-5"/>Sair</button></li>
            </ul>
          </div>
        )}
      </nav>
      {/* Espaço para navbar fixa */}
      <div className="h-16"/>

      {/* Trial Expired Modal */}
      <TrialExpiredModal 
        isOpen={showTrialModal} 
        onClose={handleTrialModalClose}
      />

      {/* Conteúdo Principal */}
      <div className="barber-container py-6 space-y-6">
        {/* HOME: Links de Agendamento + Perfil */}
        {tab === 'home' && (
          <>
            <Card className="barber-card animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-primary" />
                  <CardTitle className="barber-subtitle">Links de Agendamento</CardTitle>
                </div>
                <CardDescription>
                  Compartilhe estes links com seus clientes para agendamentos online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Link Geral */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Link Geral (Escolha de Barbeiro)</h4>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="flex-1 p-3 bg-gray-50 rounded-xl text-sm font-mono break-all">
                      {getPublicBookingUrl()}
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={copyBookingUrl} variant="outline" size="sm" className="flex-1 sm:flex-none">
                        Copiar
                      </Button>
                      <Button onClick={openBookingPage} className="barber-button-primary" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Abrir
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Permite que o cliente escolha qualquer barbeiro disponível
                  </p>
                </div>
                {/* Link Específico do Dono */}
                {profile?.name && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Seu Link Pessoal</h4>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="flex-1 p-3 bg-gray-50 rounded-xl text-sm font-mono break-all">
                        {`${window.location.origin}/booking/${profile.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()}`}
                      </div>
                      <div className="flex space-x-2">
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
                          className="flex-1 sm:flex-none"
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
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Link direto para agendamentos com você
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Perfil */}
            <Card className="barber-card animate-fade-in-up-delay">
              <CardHeader>
                <CardTitle className="barber-subtitle flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Perfil da Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <p className="text-gray-900 font-medium">{profile?.name || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <p className="text-gray-900 font-medium">{profile?.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status da Conta
                    </label>
                    <div className="flex items-center space-x-2">
                      {daysRemaining > 0 ? (
                        <Badge variant="outline" className="flex items-center space-x-1 barber-badge bg-green-50 text-green-700 border-green-200">
                          <Clock className="w-3 h-3" />
                          <span>{daysRemaining} dias restantes do trial</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center space-x-1 barber-badge">
                          <Crown className="w-3 h-3" />
                          <span>Trial expirado - Ative seu plano</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {/* Outras abas */}
        {tab === 'appointments' && (
          <Card className="barber-card animate-fade-in-up-delay">
            <CardHeader>
              <CardTitle className="barber-subtitle">Agenda</CardTitle>
              <CardDescription>Veja e gerencie seus agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentsList />
            </CardContent>
          </Card>
        )}
        {tab === 'services' && (
          <Card className="barber-card animate-fade-in-up-delay">
            <CardHeader>
              <CardTitle className="barber-subtitle">Serviços</CardTitle>
              <CardDescription>Gerencie os serviços oferecidos</CardDescription>
            </CardHeader>
            <CardContent>
              <ServicesList />
            </CardContent>
          </Card>
        )}
        {tab === 'hours' && (
          <Card className="barber-card animate-fade-in-up-delay">
            <CardHeader>
              <CardTitle className="barber-subtitle">Horários</CardTitle>
              <CardDescription>Configure os horários de atendimento</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkingHoursList />
            </CardContent>
          </Card>
        )}
        {tab === 'barbers' && (
          <Card className="barber-card animate-fade-in-up-delay">
            <CardHeader>
              <CardTitle className="barber-subtitle">Barbeiros</CardTitle>
              <CardDescription>Gerencie os barbeiros da barbearia</CardDescription>
            </CardHeader>
            <CardContent>
              <BarbersList />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
