import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isInitialized = useRef(false);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<StatsWithAppointments>({
    ...INIT_STATS,
    recentAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(0);

  const createProfile = useCallback(async (userId: string, userMetadata: any) => {
    try {
      const { data, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: userMetadata?.name || userMetadata?.full_name || 'Novo Usuário',
          phone: userMetadata?.phone || '',
          subscription_status: 'trial',
          subscription_start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (createError) {
        throw createError;
      }

      return data;
    } catch (err) {
      console.error('[useDashboardData] Error in createProfile:', err);
      throw err;
    }
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        return null;
      }

      // Primeiro tentar consultar o perfil existente
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Perfil não existe, criar um
        const newProfile = await createProfile(userId, user?.user_metadata);
        setProfile(newProfile);
        return newProfile;
      } else if (profileError) {
        throw profileError;
      }
      
      setProfile(data);
      return data;
    } catch (err) {
      console.error('[useDashboardData] Error loading profile:', err);
      setError('Falha ao carregar perfil');
      return null;
    }
  }, [user?.user_metadata, createProfile]);

  const loadDashboardStats = useCallback(async (userProfile: Profile) => {
    if (!userProfile) {
      return;
    }

    try {
      // Check if a barber with this profile already exists
      const { data: existingBarber, error: barberCheckError } = await supabase
        .from('barbers')
        .select('id')
        .eq('profile_id', userProfile.id)
        .maybeSingle();
        
      if (barberCheckError) {
        throw barberCheckError;
      }
      
      let barbersList: { id: string }[] = [];
      
      // If no barber exists for this profile, create one
      if (!existingBarber) {
        const { data: newBarber, error: createBarberError } = await supabase
          .from('barbers')
          .insert([{
            profile_id: userProfile.id,
            is_active: true,
            specialty: 'Corte de Cabelo',
            experience_years: 1
          }])
          .select('id')
          .single();
          
        if (createBarberError || !newBarber) {
          throw new Error('Não foi possível configurar sua barbearia. Por favor, tente novamente.');
        }
        
        barbersList = [newBarber];
      } else {
        barbersList = [existingBarber];
      }
      
      // If no barbers found, return early with empty stats
      if (barbersList.length === 0) {
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
        averageServiceTime: '30 min',
        recentAppointments: (appointmentsData || []).slice(0, 5)
      });

    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.message);
    }
  }, []);

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
    if (!user?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      // First load the profile
      const loadedProfile = await loadProfile(user.id);
      
      // Then load dashboard stats which depends on the profile
      if (loadedProfile) {
        await loadDashboardStats(loadedProfile);
      }
    } catch (err: any) {
      console.error('[useDashboardData] Error refreshing data:', err);
      setError(err.message || 'Falha ao carregar os dados do painel');
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadProfile, loadDashboardStats]);

  // Initialize data only once when user changes
  useEffect(() => {
    if (user?.id && !isInitialized.current) {
      isInitialized.current = true;
      refreshData();
    }
  }, [user?.id, refreshData]);

  // Calculate trial days when profile changes
  useEffect(() => {
    if (profile) {
      calculateTrialDays();
    }
  }, [profile, calculateTrialDays]);

  return {
    profile,
    stats,
    loading,
    error,
    daysRemaining,
    refreshData
  };
};
