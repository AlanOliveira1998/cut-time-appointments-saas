import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

// Define types locally since we can't import from @/types
interface AppointmentBase {
  id: string;
  status: string;
  service_id: string;
  barber_id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
  updated_at?: string;
  service_name?: string;
  service_duration?: number;
  service_price?: number;
  notes?: string;
}

interface Profile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
  updated_at: string;
  barbershop_logo?: string;
  subscription_status: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  kiwify_customer_id?: string;
  kiwify_subscription_id?: string;
  last_payment_date?: string;
}

export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  averageServiceTime: string;
  recentAppointments: Appointment[];
}

export const useDashboardData = () => {
  const { user } = useAuth();
  console.log('[useDashboardData] Initializing with user:', user?.id || 'no user');
  
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
  
  console.log('[useDashboardData] Initial state:', { loading, error, hasUser: !!user });

  const loadProfile = useCallback(async () => {
    try {
      console.log('[useDashboardData] Loading profile for user:', user?.id || 'no user');
      
      if (!user) {
        console.log('[useDashboardData] No user found, skipping profile load');
        return null;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('[useDashboardData] Error loading profile:', profileError);
        throw profileError;
      }
      
      console.log('[useDashboardData] Profile loaded:', data?.id ? 'success' : 'no data');
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Falha ao carregar perfil');
      return null;
    }
  }, []);

  const loadDashboardStats = useCallback(async () => {
    if (!user) {
      console.log('[useDashboardData] No user found, skipping stats load');
      return;
    }

    try {
      console.log('[useDashboardData] Loading dashboard stats for user:', user.id);
      
      // First get the barbers
      let barbersList: { id: string }[] = [];
      
      // Get barbers for the current user's barbershop
      const { data: barbers, error: barbersError } = await supabase
        .from('barbers')
        .select('id')
        .eq('barbershop_id', user.id);
        
      if (barbersError) throw barbersError;
      
      if (!barbers || barbers.length === 0) {
        console.log('[useDashboardData] No barbers found, creating default barber');
        // Create a default barber for this user
        const { data: newBarber, error: createBarberError } = await supabase
          .from('barbers')
          .insert([{
            barber_name: profile?.name || 'Barbeiro Principal',
            barbershop_id: user.id,
            is_active: true,
            created_at: new Date().toISOString()
          }])
          .select('id')
          .single();
          
        if (createBarberError || !newBarber) {
          console.error('[useDashboardData] Error creating default barber:', createBarberError);
          throw new Error('Não foi possível configurar sua barbearia. Por favor, tente novamente.');
        }
        
        // Use the newly created barber
        barbersList = [newBarber];
      } else {
        barbersList = barbers;
      }
      
      const barberIds = barbers.map(b => b.id);
      
      // Get appointments for these barbers
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .in('barber_id', barberIds);
        
      if (appointmentsError) throw appointmentsError;
      
      // Get services to calculate revenue
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, price')
        .in('barber_id', barberIds);
        
      if (servicesError) throw servicesError;
      
      // Calculate stats
      const totalAppointments = appointmentsData?.length || 0;
      const pendingAppointments = appointmentsData?.filter((a: any) => a.status === 'pending').length || 0;
      const completedAppointments = appointmentsData?.filter((a: any) => a.status === 'completed').length || 0;
      
      // Calculate total revenue from completed appointments
      const totalRevenue = appointmentsData
        ?.filter((a: any) => a.status === 'completed')
        .reduce((sum: number, appointment: any) => {
          const service = servicesData?.find((s: any) => s.id === appointment.service_id);
          return sum + (service?.price || 0);
        }, 0) || 0;
      
      // Set the stats
      setStats({
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalRevenue,
        averageServiceTime: '30 min', // Default value, can be calculated if needed
        recentAppointments: (appointmentsData || []).slice(0, 5) // Get 5 most recent appointments
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
    setError('');
    
    try {
      // First load the profile
      await loadProfile();
      
      // Then load dashboard stats which depends on the profile
      await loadDashboardStats();
    } catch (err: any) {
      console.error('[useDashboardData] Error refreshing data:', err);
      setError(err.message || 'Falha ao carregar os dados do painel');
    } finally {
      setLoading(false);
    }
  }, [loadProfile, loadDashboardStats]);

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
