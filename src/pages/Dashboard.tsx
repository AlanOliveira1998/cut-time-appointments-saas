import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrialExpiredModal } from '../components/TrialExpiredModal';
import { ServicesList } from '../components/dashboard/ServicesList';
import { WorkingHoursList } from '../components/dashboard/WorkingHoursList';
import { BarbersList } from '../components/dashboard/BarbersList';
import { AppointmentsList } from '../components/dashboard/AppointmentsList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardPage } from './DashboardPage';
import { Button } from '@/components/ui/button';

/**
 * @deprecated Use DashboardPage component instead
 * This component is kept for backward compatibility and will be removed in a future version.
 * All functionality has been moved to the new DashboardPage component.
 */
const Dashboard = () => {
  const { user, logout, isTrialExpired, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      // If user is not authenticated, redirect to login
      if (!user) {
        navigate('/auth');
      checkTrialStatus();
    }
  }, [user, loading, isTrialExpired, showTrialModal]);

  // Carregar logo da barbearia
  const loadBarbershopLogo = async () => {
    if (!user) return;

    try {
      // Por enquanto, vamos usar uma abordagem mais simples
      // até que a migration seja aplicada
      const storedLogo = localStorage.getItem(`barbershop_logo_${user.id}`);
      if (storedLogo) {
        setBarbershopLogo(storedLogo);
      }
    } catch (error) {
      console.error('Error loading barbershop logo:', error);
    }
  };

  // Upload da logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      // Por enquanto, vamos usar uma abordagem mais simples
      // Convertendo a imagem para base64 e salvando no localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setBarbershopLogo(result);
          localStorage.setItem(`barbershop_logo_${user.id}`, result);
          toast({
            title: "Logo atualizada!",
            description: "A logo da sua barbearia foi atualizada com sucesso.",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erro ao atualizar logo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Carregar todos os agendamentos para o financeiro e dashboards
  useEffect(() => {
    if (tab === 'finance' || tab === 'dashboards') {
      setFinanceLoading(true);
      supabase
        .from('appointments')
        .select('*, barbers:barber_id(*, profiles(*)), services:service_id(name, price, duration)')
        .then(({ data, error }) => {
          setFinanceLoading(false);
          if (!error && data) setFinanceAppointments(data);
        });
    }
  }, [tab]);

  // Exportação CSV
  function exportFinanceCSV() {
    const header = ['Barbeiro','Serviço','Cliente','Data','Hora','Valor','Status'];
    const rows = financeAppointments
      .filter(a => (selectedBarberFinance === 'all' || (a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono') === selectedBarberFinance))
      .filter(a => (financeStatus === 'all' || a.status === financeStatus))
      .filter(a => (!financeStart || a.appointment_date >= financeStart))
      .filter(a => (!financeEnd || a.appointment_date <= financeEnd))
      .map(a => [
        a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono',
        a.services?.name || '-',
        a.client_name,
        a.appointment_date,
        a.appointment_time,
        a.services?.price ? a.services.price.toFixed(2) : '-',
        a.status
      ]);
    const csv = [header, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financeiro.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Totais filtrados
  const filteredFinance = financeAppointments
    .filter(a => (selectedBarberFinance === 'all' || (a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono') === selectedBarberFinance))
    .filter(a => (financeStatus === 'all' || a.status === financeStatus))
    .filter(a => (!financeStart || a.appointment_date >= financeStart))
    .filter(a => (!financeEnd || a.appointment_date <= financeEnd));
  const totalValue = filteredFinance.reduce((acc, a) => acc + (a.services?.price || 0), 0);
  const totalCount = filteredFinance.length;

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

  const handleTrialModalClose = async () => {
    // Não permitir fechar o modal se o trial expirou
    const expired = await isTrialExpired();
    if (expired) {
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

  // Função para testar ativação de assinatura (apenas para desenvolvimento)
  const handleTestSubscription = async () => {
    if (!user) return;
    
    try {
      await simulateSubscriptionActivation(user.id);
      // Recarregar página para atualizar status
      window.location.reload();
    } catch (error) {
      console.error('Erro ao testar assinatura:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar fixa */}
      <nav className="barber-header w-full fixed top-0 left-0 z-50 shadow-sm">
        <div className="barber-container flex items-center justify-between h-16">
          {/* Logo (opcional) */}
          <div className="flex items-center gap-2">
            {barbershopLogo && (
              <img src={barbershopLogo} alt="Barbearia Logo" className="w-8 h-8 rounded-full" />
            )}
          </div>
          {/* Menu desktop */}
          <ul className="hidden md:flex items-center gap-6 text-gray-800 font-medium text-base">
            <li><button onClick={()=>setTab('home')} className={tab==='home'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Home className="w-5 h-5"/>Home</button></li>
            <li><button onClick={()=>setTab('appointments')} className={tab==='appointments'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Calendar className="w-5 h-5"/>Agenda</button></li>
            <li><button onClick={()=>setTab('services')} className={tab==='services'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Scissors className="w-5 h-5"/>Serviços</button></li>
            <li><button onClick={()=>setTab('hours')} className={tab==='hours'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Clock className="w-5 h-5"/>Horários</button></li>
            <li><button onClick={()=>setTab('barbers')} className={tab==='barbers'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><Users className="w-5 h-5"/>Barbeiros</button></li>
            <li><button onClick={()=>setTab('finance')} className={tab==='finance'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><DollarSign className="w-5 h-5"/>Financeiro</button></li>
            <li><button onClick={()=>setTab('dashboards')} className={tab==='dashboards'?'text-primary flex items-center gap-1':'flex items-center gap-1'}><BarChart2 className="w-5 h-5"/>Dashboards</button></li>
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
              <li><button onClick={()=>{setTab('finance');setMobileMenuOpen(false);}} className={tab==='finance'?'text-primary flex items-center gap-2':'flex items-center gap-2'}><DollarSign className="w-5 h-5"/>Financeiro</button></li>
              <li><button onClick={()=>{setTab('dashboards');setMobileMenuOpen(false);}} className={tab==='dashboards'?'text-primary flex items-center gap-2':'flex items-center gap-2'}><BarChart2 className="w-5 h-5"/>Dashboards</button></li>
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
                      
                      {/* Botão de teste para desenvolvimento */}
                      {process.env.NODE_ENV === 'development' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleTestSubscription}
                          className="ml-2 text-xs"
                        >
                          🧪 Testar Ativação
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logo da Barbearia */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Logo da Barbearia</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                      {barbershopLogo ? (
                        <img 
                          src={barbershopLogo} 
                          alt="Logo da Barbearia" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Scissors className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        {barbershopLogo 
                          ? "Sua logo aparece na navbar e nos links de agendamento" 
                          : "Adicione a logo da sua barbearia para personalizar o sistema"
                        }
                      </p>
                      <label className="barber-button-primary cursor-pointer inline-flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        {barbershopLogo ? 'Alterar Logo' : 'Adicionar Logo'}
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {/* FINANCEIRO */}
        {tab === 'finance' && (
          <Card className="barber-card animate-fade-in-up-delay">
            <CardHeader>
              <CardTitle className="barber-subtitle flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Financeiro
              </CardTitle>
              <CardDescription>Veja todos os serviços executados e agendados, filtrando por barbeiro, período e status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-wrap">
                <label className="font-medium text-sm">Barbeiro:</label>
                <select
                  className="barber-input w-auto"
                  value={selectedBarberFinance}
                  onChange={e => setSelectedBarberFinance(e.target.value)}
                >
                  <option value="all">Todos</option>
                  {Array.from(new Set(financeAppointments.map(a => a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono'))).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <label className="font-medium text-sm ml-2">Status:</label>
                <select
                  className="barber-input w-auto"
                  value={financeStatus}
                  onChange={e => setFinanceStatus(e.target.value as any)}
                >
                  <option value="all">Todos</option>
                  <option value="scheduled">Agendado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <label className="font-medium text-sm ml-2">Período:</label>
                <input type="date" className="barber-input w-auto" value={financeStart} onChange={e=>setFinanceStart(e.target.value)} />
                <span className="mx-1">-</span>
                <input type="date" className="barber-input w-auto" value={financeEnd} onChange={e=>setFinanceEnd(e.target.value)} />
                <Button onClick={exportFinanceCSV} size="sm" className="ml-auto bg-primary text-white flex items-center gap-1"><BarChart2 className="w-4 h-4"/>Exportar CSV</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left">Barbeiro</th>
                      <th className="px-3 py-2 text-left">Serviço</th>
                      <th className="px-3 py-2 text-left">Cliente</th>
                      <th className="px-3 py-2 text-left">Data</th>
                      <th className="px-3 py-2 text-left">Hora</th>
                      <th className="px-3 py-2 text-left">Valor</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeLoading ? (
                      <tr><td colSpan={7} className="text-center py-8">Carregando...</td></tr>
                    ) : (
                      filteredFinance.map(a => (
                        <tr key={a.id} className="border-b">
                          <td className="px-3 py-2">{a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono'}</td>
                          <td className="px-3 py-2">{a.services?.name || '-'}</td>
                          <td className="px-3 py-2">{a.client_name}</td>
                          <td className="px-3 py-2">{a.appointment_date}</td>
                          <td className="px-3 py-2">{a.appointment_time}</td>
                          <td className="px-3 py-2">R$ {a.services?.price ? a.services.price.toFixed(2) : '-'}</td>
                          <td className="px-3 py-2">{a.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        {/* DASHBOARDS */}
        {tab === 'dashboards' && (
          <Card className="barber-card animate-fade-in-up-delay">
            <CardHeader>
              <CardTitle className="barber-subtitle flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Dashboards
              </CardTitle>
              <CardDescription>Visualize métricas detalhadas da sua barbearia.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros para os gráficos */}
              <div className="mb-6 flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-wrap">
                <label className="font-medium text-sm">Barbeiro:</label>
                <select
                  className="barber-input w-auto"
                  value={selectedBarberFinance}
                  onChange={e => setSelectedBarberFinance(e.target.value)}
                >
                  <option value="all">Todos</option>
                  {Array.from(new Set(financeAppointments.map(a => a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono'))).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <label className="font-medium text-sm ml-2">Status:</label>
                <select
                  className="barber-input w-auto"
                  value={financeStatus}
                  onChange={e => setFinanceStatus(e.target.value as any)}
                >
                  <option value="all">Todos</option>
                  <option value="scheduled">Agendado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <label className="font-medium text-sm ml-2">Período:</label>
                <input type="date" className="barber-input w-auto" value={financeStart} onChange={e=>setFinanceStart(e.target.value)} />
                <span className="mx-1">-</span>
                <input type="date" className="barber-input w-auto" value={financeEnd} onChange={e=>setFinanceEnd(e.target.value)} />
              </div>

              {/* RESUMO FINANCEIRO */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Faturado</p>
                      <p className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                    <DollarSign className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Serviços Realizados</p>
                      <p className="text-2xl font-bold">{totalCount}</p>
                    </div>
                    <Scissors className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Ticket Médio</p>
                      <p className="text-2xl font-bold">
                        R$ {totalCount > 0 ? (totalValue / totalCount).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00'}
                      </p>
                    </div>
                    <BarChart2 className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Barbeiros Ativos</p>
                      <p className="text-2xl font-bold">
                        {Array.from(new Set(filteredFinance.map(a => a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono'))).length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>

              {/* GRÁFICOS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Gráfico de Barras: Valor por Barbeiro */}
                <div className="bg-white rounded-xl shadow p-4">
                  <h4 className="font-semibold text-sm mb-2">Faturamento por Barbeiro</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={(() => {
                      // Agrupa valor por barbeiro
                      const map = new Map();
                      filteredFinance.forEach(a => {
                        const name = a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono';
                        map.set(name, (map.get(name) || 0) + (a.services?.price || 0));
                      });
                      return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
                    })()}>
                      <XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={80} />
                      <YAxis fontSize={11} tickFormatter={v => `R$ ${v.toLocaleString()}`}/>
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Faturamento']}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" fill="#00657C" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Linha: Faturamento Mensal */}
                <div className="bg-white rounded-xl shadow p-4">
                  <h4 className="font-semibold text-sm mb-2">Faturamento Mensal</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={(() => {
                      // Agrupa valor por mês/ano
                      const map = new Map();
                      filteredFinance.forEach(a => {
                        const date = new Date(a.appointment_date);
                        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        map.set(monthYear, (map.get(monthYear) || 0) + (a.services?.price || 0));
                      });
                      // Ordena por data e formata labels
                      return Array.from(map, ([monthYear, value]) => {
                        const [year, month] = monthYear.split('-');
                        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                        return { 
                          monthYear, 
                          label: `${monthNames[parseInt(month) - 1]}/${year}`, 
                          value 
                        };
                      }).sort((a, b) => a.monthYear.localeCompare(b.monthYear));
                    })()}>
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis fontSize={11} tickFormatter={v => `R$ ${v.toLocaleString()}`}/>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Faturamento']}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#E63946" strokeWidth={3} dot={{ r: 5, fill: '#E63946' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Pizza: Distribuição por Serviço */}
                <div className="bg-white rounded-xl shadow p-4">
                  <h4 className="font-semibold text-sm mb-2">Distribuição de Serviços</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={(() => {
                          // Agrupa quantidade por serviço
                          const map = new Map();
                          filteredFinance.forEach(a => {
                            const name = a.services?.name || '-';
                            map.set(name, (map.get(name) || 0) + 1);
                          });
                          return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
                        })()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#00657C"
                        label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}
                      >
                        {(() => {
                          const colors = ['#00657C', '#E63946', '#22223B', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557', '#A8DADC'];
                          const data = (() => {
                            const map = new Map();
                            filteredFinance.forEach(a => {
                              const name = a.services?.name || '-';
                              map.set(name, (map.get(name) || 0) + 1);
                            });
                            return Array.from(map);
                          })();
                          return data.map((entry, idx) => <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />);
                        })()}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} serviços`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Barras: Performance por Barbeiro (Quantidade) */}
                <div className="bg-white rounded-xl shadow p-4">
                  <h4 className="font-semibold text-sm mb-2">Serviços Realizados por Barbeiro</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={(() => {
                      // Agrupa quantidade por barbeiro
                      const map = new Map();
                      filteredFinance.forEach(a => {
                        const name = a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono';
                        map.set(name, (map.get(name) || 0) + 1);
                      });
                      return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
                    })()}>
                      <XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={80} />
                      <YAxis fontSize={11} />
                      <Tooltip 
                        formatter={(value) => [`${value} serviços`, 'Quantidade']}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" fill="#16A34A" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
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
