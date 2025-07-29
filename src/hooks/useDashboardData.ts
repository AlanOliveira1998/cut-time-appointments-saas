import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  averageServiceTime: string;
  recentAppointments: Appointment[];
}

export const useDashboardData = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    averageServiceTime: '0 min',
    recentAppointments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Falha ao carregar perfil');
      return null;
    }
  }, []);

  const loadDashboardStats = useCallback(async () => {
    try {
      // Carrega as estatísticas principais
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_dashboard_stats');

      if (statsError) throw statsError;

      // Carrega os agendamentos recentes
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          client_name,
          service_name,
          date,
          status,
          services!inner(price)
        `)
        .in('barber_id', barberIds)
        .gte('appointment_date', startOfMonth);

      if (appointmentsError) throw appointmentsError;

      // Get services count
      const { count: servicesCount, error: servicesError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .in('barber_id', barberIds);

      if (servicesError) throw servicesError;

      // Calculate stats
      const totalAppointments = appointments?.length || 0;
      const todayAppointments = appointments?.filter(a => a.appointment_date === today).length || 0;
      const monthlyRevenue = appointments?.reduce((sum, appointment) => {
        if (appointment.status === 'completed') {
          return sum + (appointment.services?.price || 0);
        }
        return sum;
      }, 0) || 0;

      setStats({
        totalAppointments,
        todayAppointments,
        monthlyRevenue,
        activeServices: servicesCount || 0
      });

    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.message);
    }
  }, [user]);

  const calculateTrialDays = useCallback(() => {
    if (!profile) return;

    const startDate = profile.subscription_start_date 
      ? new Date(profile.subscription_start_date) 
      : new Date();
    
    const trialEndDate = new Date(startDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial
    
    const today = new Date();
    const diffTime = trialEndDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysRemaining(Math.max(0, diffDays));
  }, [profile]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([loadProfile(), loadStats()]);
    } finally {
      setLoading(false);
    }
  }, [loadProfile, loadStats]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  useEffect(() => {
    calculateTrialDays();
  }, [calculateTrialDays]);

  return {
    profile,
    stats,
    loading,
    error,
    daysRemaining,
    refreshData
  };
};
