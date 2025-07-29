import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

// Basic type definitions
interface Appointment {
  id: string;
  status: string;
  service_id: string;
  barber_id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
}

interface Profile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  subscription_status?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  kiwify_customer_id?: string;
  kiwify_subscription_id?: string;
  last_payment_date?: string;
  barbershop_logo?: string;
  created_at?: string;
  updated_at?: string;
}

// Separate stats into numbers and full stats
interface StatsNumbers {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  averageServiceTime: string;
}

interface StatsWithAppointments extends StatsNumbers {
  recentAppointments: Appointment[];
}

// Initial state values
const INIT_STATS: StatsNumbers = {
  totalAppointments: 0,
  pendingAppointments: 0,
  completedAppointments: 0,
  totalRevenue: 0,
  averageServiceTime: '0 min'
};

export const useDashboardData = () => {
  const { user } = useAuth();
  console.log('[useDashboardData] Initializing with user:', user?.id || 'no user');
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<StatsWithAppointments>({
    ...INIT_STATS,
    recentAppointments: []
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
      
      // First ensure we have a profile
      if (!profile) {
        throw new Error('Perfil do usuário não encontrado. Por favor, atualize seu perfil primeiro.');
      }
      
      // Check if a barber with this profile already exists
      const { data: existingBarber, error: barberCheckError } = await supabase
        .from('barbers')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();
        
      if (barberCheckError) {
        console.error('[useDashboardData] Error checking for existing barber:', barberCheckError);
        throw barberCheckError;
      }
      
      // If no barber exists for this profile, create one
      if (!existingBarber) {
        console.log('[useDashboardData] No barber found for profile, creating default barber');
        
        const { data: newBarber, error: createBarberError } = await supabase
          .from('barbers')
          .insert([{
            profile_id: profile.id,  // Reference the user's profile
            is_active: true,
            specialty: 'Corte de Cabelo',
            experience_years: 1
            // created_at and updated_at are automatically set by the database
          }])
          .select('id')
          .single();
          
        if (createBarberError || !newBarber) {
          console.error('[useDashboardData] Error creating default barber:', createBarberError);
          throw new Error('Não foi possível configurar sua barbearia. Por favor, tente novamente.');
        }
        
        // Use the newly created barber
        barbersList = [newBarber];
      } else if (existingBarber) {
        // Use the existing barber
        barbersList = [existingBarber];
      }
      
      // If no barbers found, return early with empty stats
      if (barbersList.length === 0) {
        console.log('[useDashboardData] No barbers found, returning empty stats');
        setStats({
          totalAppointments: 0,
          pendingAppointments: 0,
          completedAppointments: 0,
          totalRevenue: 0,
          averageServiceTime: '0 min',
          recentAppointments: []
        });
        return;
      }
      
      const barberIds = barbersList.map(b => b.id);
      
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
