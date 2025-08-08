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

// Timeout configuration
const TIMEOUT_MS = 10000; // 10 seconds
const DEBOUNCE_MS = 300; // 300ms

export const useDashboardData = () => {
  const { user } = useAuth();
  
  // Refs para controle de estado mutável
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<StatsWithAppointments>({
    ...INIT_STATS,
    recentAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Função para verificar se componente está montado
  const isMounted = useCallback(() => isMountedRef.current, []);

  // Função para limpar recursos
  const cleanup = useCallback(() => {
    console.log('[useDashboardData] Cleaning up resources...');
    
    // Limpar debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    // Limpar timeout geral
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Abortar operações pendentes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Função para criar perfil com timeout
  const createProfile = useCallback(async (userId: string, userMetadata: any): Promise<Profile | null> => {
    if (!isMounted()) {
      console.log('[useDashboardData] Component unmounted, skipping profile creation');
      return null;
    }

    try {
      console.log('[useDashboardData] Creating profile...');
      
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
        console.error('[useDashboardData] Create profile error:', createError);
        throw createError;
      }

      console.log('[useDashboardData] Profile created successfully');
      return data;
    } catch (err) {
      console.error('[useDashboardData] Error in createProfile:', err);
      throw err;
    }
  }, [isMounted]);

  // Função para carregar perfil com timeout
  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!isMounted() || !userId) {
      console.log('[useDashboardData] No userId provided or component unmounted');
      return null;
    }

    try {
      console.log('[useDashboardData] Checking for existing profile for user:', userId);
      
      // Criar timeout para a operação
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Profile query timeout'));
        }, TIMEOUT_MS);
      });

      // Query principal
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Race entre query e timeout
      const { data, error: profileError } = await Promise.race([queryPromise, timeoutPromise]);

      // Limpar timeout se ainda não foi executado
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (profileError && profileError.code === 'PGRST116') {
        // Perfil não existe, criar um
        console.log('[useDashboardData] Profile not found, creating new one...');
        const newProfile = await createProfile(userId, user?.user_metadata);
        if (newProfile && isMounted()) {
          setProfile(newProfile);
          console.log('[useDashboardData] New profile created successfully');
        } else {
          console.log('[useDashboardData] Failed to create new profile');
        }
        return newProfile;
      } else if (profileError) {
        console.error('[useDashboardData] Profile error:', profileError);
        // Se for outro erro, tentar criar o perfil mesmo assim
        console.log('[useDashboardData] Trying to create profile due to error...');
        const newProfile = await createProfile(userId, user?.user_metadata);
        if (newProfile && isMounted()) {
          setProfile(newProfile);
        }
        return newProfile;
      }
      
      console.log('[useDashboardData] Existing profile found');
      if (isMounted()) {
        setProfile(data);
      }
      return data;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useDashboardData] Profile load aborted');
        return null;
      }
      console.error('[useDashboardData] Error loading profile:', err);
      return null;
    }
  }, [user?.user_metadata, createProfile, isMounted]);

  // Função para calcular estatísticas
  const calculateStats = useCallback((appointmentsData: any[], servicesData: any[]) => {
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
    
    return {
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalRevenue,
      averageServiceTime: '30 min',
      recentAppointments: (appointmentsData || []).slice(0, 5)
    };
  }, []);

  // Função para carregar estatísticas do dashboard com carregamento paralelo
  const loadDashboardStats = useCallback(async (userProfile: Profile) => {
    if (!isMounted() || !userProfile) {
      console.log('[useDashboardData] No userProfile provided or component unmounted');
      return;
    }

    let statsAbortController: AbortController | null = null;

    try {
      console.log('[useDashboardData] Checking for existing barber for profile:', userProfile.id);
      
      // Criar AbortController para esta operação
      statsAbortController = new AbortController();
      abortControllerRef.current = statsAbortController;
      
      // Check if a barber with this profile already exists
      const { data: existingBarber, error: barberCheckError } = await supabase
        .from('barbers')
        .select('id')
        .eq('profile_id', userProfile.id)
        .maybeSingle();
        
      if (statsAbortController.signal.aborted) {
        console.log('[useDashboardData] Stats load aborted');
        return;
      }
        
      if (barberCheckError) {
        console.error('[useDashboardData] Barber check error:', barberCheckError);
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
          
        if (statsAbortController.signal.aborted) {
          console.log('[useDashboardData] Barber creation aborted');
          return;
        }
          
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
        if (isMounted()) {
          setStats({
            totalAppointments: 0,
            pendingAppointments: 0,
            completedAppointments: 0,
            totalRevenue: 0,
            averageServiceTime: '0 min',
            recentAppointments: []
          });
        }
        return;
      }
      
      const barberIds = barbersList.map(b => b.id);
      console.log('[useDashboardData] Loading appointments and services for barbers:', barberIds);
      
      // Carregamento paralelo de appointments e services
      const [appointmentsResult, servicesResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('*')
          .in('barber_id', barberIds),
        supabase
          .from('services')
          .select('id, price')
          .in('barber_id', barberIds)
      ]);
      
      if (statsAbortController.signal.aborted) {
        console.log('[useDashboardData] Parallel load aborted');
        return;
      }
      
      if (appointmentsResult.error) {
        console.error('[useDashboardData] Appointments error:', appointmentsResult.error);
        throw appointmentsResult.error;
      }
      
      if (servicesResult.error) {
        console.error('[useDashboardData] Services error:', servicesResult.error);
        throw servicesResult.error;
      }
      
      // Calcular estatísticas
      const calculatedStats = calculateStats(appointmentsResult.data || [], servicesResult.data || []);
      
      console.log('[useDashboardData] Stats calculated:', calculatedStats);
      
      // Set the stats
      if (isMounted()) {
        setStats(calculatedStats);
      }

    } catch (err: any) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useDashboardData] Stats load aborted');
        return;
      }
      console.error('[useDashboardData] Error loading stats:', err);
      if (isMounted()) {
        setError(err.message);
      }
    } finally {
      if (abortControllerRef.current === statsAbortController) {
        abortControllerRef.current = null;
      }
    }
  }, [isMounted, calculateStats]);

  // Função para calcular dias restantes do trial
  const calculateTrialDays = useCallback(() => {
    if (!profile || !isMounted()) return;

    const startDate = profile.subscription_start_date 
      ? new Date(profile.subscription_start_date) 
      : new Date();
    
    const trialEndDate = new Date(startDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial
    
    const today = new Date();
    const diffTime = trialEndDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (isMounted()) {
      setDaysRemaining(Math.max(0, diffDays));
    }
  }, [profile, isMounted]);

  // Função principal para atualizar dados
  const refreshData = useCallback(async () => {
    if (!user?.id || !isMounted()) {
      console.log('[useDashboardData] No user ID or component unmounted, skipping refresh');
      return;
    }
    
    // Evitar execuções simultâneas
    if (loadingRef.current) {
      console.log('[useDashboardData] Already loading, skipping refresh');
      return;
    }
    
    // Verificar se já foi inicializado para este usuário
    if (isInitializedRef.current && profile?.id === user.id) {
      console.log('[useDashboardData] Already initialized for this user, skipping refresh');
      return;
    }
    
    console.log('[useDashboardData] Starting to refresh data for user:', user.id);
    loadingRef.current = true;
    
    if (isMounted()) {
      setLoading(true);
      setError('');
    }
    
    try {
      // First load the profile
      console.log('[useDashboardData] Loading profile...');
      const loadedProfile = await loadProfile(user.id);
      console.log('[useDashboardData] Profile loaded:', loadedProfile ? 'success' : 'failed');
      
      // Verificar se componente ainda está montado antes de continuar
      if (!isMounted()) {
        console.log('[useDashboardData] Component unmounted during profile load, stopping');
        return;
      }
      
      // Then load dashboard stats which depends on the profile
      if (loadedProfile) {
        console.log('[useDashboardData] Loading dashboard stats...');
        await loadDashboardStats(loadedProfile);
        console.log('[useDashboardData] Dashboard stats loaded successfully');
      } else {
        console.log('[useDashboardData] No profile loaded, setting empty stats');
        if (isMounted()) {
          setStats({
            ...INIT_STATS,
            recentAppointments: []
          });
        }
      }
    } catch (err: any) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useDashboardData] Data refresh aborted');
        return;
      }
      console.error('[useDashboardData] Error refreshing data:', err);
      if (isMounted()) {
        setError(err.message || 'Falha ao carregar os dados do painel');
      }
    } finally {
      if (isMounted()) {
        console.log('[useDashboardData] Setting loading to false');
        setLoading(false);
        loadingRef.current = false;
      }
    }
  }, [user?.id, loadProfile, loadDashboardStats, profile?.id, isMounted]);

  // Initialize data when user changes
  useEffect(() => {
    isMountedRef.current = true;
    loadingRef.current = false;
    isInitializedRef.current = false;
    
    console.log('[useDashboardData] useEffect triggered with user?.id:', user?.id);
    
    if (user?.id) {
      // Evitar execuções desnecessárias se o user ID não mudou
      if (lastUserIdRef.current === user?.id && isInitializedRef.current) {
        console.log('[useDashboardData] User ID unchanged, skipping refresh');
        return;
      }
      
      console.log('[useDashboardData] User changed, scheduling refresh...');
      lastUserIdRef.current = user?.id;
      
      // Debounce para evitar múltiplas execuções
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        if (isMounted() && !loadingRef.current) {
          console.log('[useDashboardData] Executing refresh after debounce');
          isInitializedRef.current = true;
          refreshData();
        } else if (!isMounted()) {
          console.log('[useDashboardData] Component unmounted, skipping refresh');
        } else if (loadingRef.current) {
          console.log('[useDashboardData] Already loading, skipping refresh');
        }
      }, DEBOUNCE_MS);
      
    } else {
      console.log('[useDashboardData] No user, resetting state...');
      lastUserIdRef.current = null;
      isInitializedRef.current = false;
      // Reset state when user is not available
      if (isMounted()) {
        setProfile(null);
        setStats({
          ...INIT_STATS,
          recentAppointments: []
        });
        setLoading(false);
        setError('');
        setDaysRemaining(0);
      }
    }
    
    return () => {
      console.log('[useDashboardData] Cleanup: component unmounted');
      isMountedRef.current = false;
      cleanup();
    };
  }, [user?.id, refreshData, cleanup, isMounted]);

  // Calculate trial days when profile changes
  useEffect(() => {
    if (profile && isMounted()) {
      calculateTrialDays();
    }
  }, [profile, calculateTrialDays, isMounted]);

  return {
    profile,
    stats,
    loading,
    error,
    daysRemaining,
    refreshData
  };
};
