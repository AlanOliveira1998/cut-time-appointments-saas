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
      console.log('[useDashboardData] Creating profile...');
      
      const createPromise = supabase
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

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile creation timeout')), 5000);
      });

      const { data, error: createError } = await Promise.race([createPromise, timeoutPromise]) as any;

      if (createError) {
        throw createError;
      }

      console.log('[useDashboardData] Profile created successfully');
      return data;
    } catch (err) {
      console.error('[useDashboardData] Error in createProfile:', err);
      throw err;
    }
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        console.log('[useDashboardData] No userId provided');
        return null;
      }

      console.log('[useDashboardData] Checking for existing profile...');
      
      // Add timeout for profile query
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile query timeout')), 5000);
      });

      const { data, error: profileError } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (profileError && profileError.code === 'PGRST116') {
        // Perfil não existe, criar um
        console.log('[useDashboardData] Profile not found, creating new one...');
        const newProfile = await createProfile(userId, user?.user_metadata);
        setProfile(newProfile);
        console.log('[useDashboardData] New profile created:', newProfile ? 'success' : 'failed');
        return newProfile;
      } else if (profileError) {
        throw profileError;
      }
      
      console.log('[useDashboardData] Existing profile found');
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
      console.log('[useDashboardData] No userProfile provided');
      return;
    }

    try {
      console.log('[useDashboardData] Checking for existing barber...');
      
      // Add timeout for barber check
      const barberCheckPromise = supabase
        .from('barbers')
        .select('id')
        .eq('profile_id', userProfile.id)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Barber check timeout')), 5000);
      });

      const { data: existingBarber, error: barberCheckError } = await Promise.race([barberCheckPromise, timeoutPromise]) as any;
        
      if (barberCheckError) {
        throw barberCheckError;
      }
      
      let barbersList: { id: string }[] = [];
      
      // If no barber exists for this profile, create one
      if (!existingBarber) {
        console.log('[useDashboardData] No barber found, creating new one...');
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
        console.log('[useDashboardData] New barber created:', newBarber.id);
      } else {
        barbersList = [existingBarber];
        console.log('[useDashboardData] Existing barber found:', existingBarber.id);
      }
      
      // If no barbers found, return early with empty stats
      if (barbersList.length === 0) {
        console.log('[useDashboardData] No barbers found, setting empty stats');
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
      console.log('[useDashboardData] Loading appointments for barbers:', barberIds);
      
      // Get appointments for these barbers with timeout
      const appointmentsPromise = supabase
        .from('appointments')
        .select('*')
        .in('barber_id', barberIds);

      const appointmentsTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Appointments query timeout')), 5000);
      });

      const { data: appointmentsData, error: appointmentsError } = await Promise.race([appointmentsPromise, appointmentsTimeoutPromise]) as any;
        
      if (appointmentsError) throw appointmentsError;
      
      console.log('[useDashboardData] Loading services for barbers...');
      // Get services to calculate revenue with timeout
      const servicesPromise = supabase
        .from('services')
        .select('id, price')
        .in('barber_id', barberIds);

      const servicesTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Services query timeout')), 5000);
      });

      const { data: servicesData, error: servicesError } = await Promise.race([servicesPromise, servicesTimeoutPromise]) as any;
        
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
      
      console.log('[useDashboardData] Stats calculated:', { totalAppointments, pendingAppointments, completedAppointments, totalRevenue });
      
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
      console.error('[useDashboardData] Error loading stats:', err);
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
    
    console.log('[useDashboardData] Starting to refresh data...');
    setLoading(true);
    setError('');
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('[useDashboardData] Timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000);
    
    try {
      // First load the profile
      console.log('[useDashboardData] Loading profile...');
      const loadedProfile = await loadProfile(user.id);
      console.log('[useDashboardData] Profile loaded:', loadedProfile ? 'success' : 'failed');
      
      // Then load dashboard stats which depends on the profile
      if (loadedProfile) {
        console.log('[useDashboardData] Loading dashboard stats...');
        await loadDashboardStats(loadedProfile);
        console.log('[useDashboardData] Dashboard stats loaded successfully');
      }
    } catch (err: any) {
      console.error('[useDashboardData] Error refreshing data:', err);
      setError(err.message || 'Falha ao carregar os dados do painel');
    } finally {
      clearTimeout(timeoutId);
      console.log('[useDashboardData] Setting loading to false');
      setLoading(false);
    }
  }, [user?.id, loadProfile, loadDashboardStats]);

  // Initialize data when user changes
  useEffect(() => {
    if (user?.id) {
      refreshData();
    } else {
      // Reset state when user is not available
      setProfile(null);
      setStats({
        ...INIT_STATS,
        recentAppointments: []
      });
      setLoading(false);
      setError('');
      setDaysRemaining(0);
      isInitialized.current = false;
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
