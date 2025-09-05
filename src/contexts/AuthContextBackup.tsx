import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthService, LoginCredentials, RegisterCredentials } from '../services/authService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isTrialExpired: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Refs para controle de estado mutável
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para verificar se componente está montado
  const isMounted = useCallback(() => isMountedRef.current, []);

  // Função para limpar timeouts e abort controllers
  const cleanup = useCallback(() => {
    console.log('[AuthContext] Cleaning up resources...');
    
    // Limpar debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    // Limpar fallback timeout
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    
    // Abortar operações pendentes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Desinscrever do listener
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
      console.log('[AuthContext] Auth subscription unsubscribed');
    }
  }, []);

  // Função para garantir que o usuário tenha um perfil
  const ensureUserProfile = useCallback(async (user: User) => {
    if (!isMounted() || !user?.id) {
      console.log('[AuthContext] Skipping profile creation - component unmounted or no user');
      return;
    }

    let profileAbortController: AbortController | null = null;
    
    try {
      console.log('[AuthContext] Ensuring profile for user:', user.id);
      
      // Criar novo AbortController para esta operação
      profileAbortController = new AbortController();
      abortControllerRef.current = profileAbortController;
      
      // Verificar se o perfil já existe usando o AuthService
      const { data: profileExists, error: profileError } = await AuthService.checkProfileExists(user.id);
      
      if (profileAbortController.signal.aborted) {
        console.log('[AuthContext] Profile check aborted');
        return;
      }
      
      if (profileError) {
        console.error('[AuthContext] Error checking profile:', profileError);
        return;
      }
      
      if (!profileExists) {
        console.log('[AuthContext] Profile does not exist, creating new one...');
        
        // Perfil não existe, criar um usando o AuthService
        const { error: createError } = await AuthService.createProfile({
          id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Novo Usuário',
          phone: user.user_metadata?.phone || '',
          subscription_status: 'trial',
          subscription_start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (profileAbortController.signal.aborted) {
          console.log('[AuthContext] Profile creation aborted');
          return;
        }

        if (createError) {
          console.error('[AuthContext] Error creating profile:', createError);
        } else {
          console.log('[AuthContext] Profile created successfully');
        }
      } else {
        console.log('[AuthContext] Profile already exists');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[AuthContext] Profile operation aborted');
        return;
      }
      console.error('[AuthContext] Error in ensureUserProfile:', error);
    } finally {
      if (abortControllerRef.current === profileAbortController) {
        abortControllerRef.current = null;
      }
    }
  }, [isMounted]);

  // Função para debounce de eventos
  const debouncedEnsureProfile = useCallback((user: User) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (isMounted()) {
        ensureUserProfile(user).catch((error) => {
          console.error('[AuthContext] Error in debounced profile creation:', error);
        });
      }
    }, 300);
  }, [ensureUserProfile, isMounted]);

  // Função para inicializar autenticação
  const initializeAuth = useCallback(async () => {
    if (!isMounted() || loadingRef.current) {
      console.log('[AuthContext] Skipping initialization - component unmounted or already loading');
      return;
    }

    loadingRef.current = true;
    let initAbortController: AbortController | null = null;
    
    try {
      console.log('[AuthContext] Initializing authentication...');
      
      // Criar novo AbortController para inicialização
      initAbortController = new AbortController();
      abortControllerRef.current = initAbortController;
      
      const { data: session, error } = await AuthService.getCurrentSession();
      
      if (initAbortController.signal.aborted) {
        console.log('[AuthContext] Initialization aborted');
        return;
      }
      
      if (error) {
        console.error('[AuthContext] Error getting session:', error);
      }
      
      if (isMounted()) {
        console.log('[AuthContext] Session loaded:', session ? 'User logged in' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        hasInitializedRef.current = true;
        console.log('[AuthContext] Loading set to false (initialization)');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[AuthContext] Initialization aborted');
        return;
      }
      console.error('[AuthContext] Auth initialization error:', error);
      if (isMounted()) {
        setLoading(false);
        hasInitializedRef.current = true;
        console.log('[AuthContext] Loading set to false (error case)');
      }
    } finally {
      loadingRef.current = false;
      if (abortControllerRef.current === initAbortController) {
        abortControllerRef.current = null;
      }
    }
  }, [isMounted]);

  // Função para lidar com mudanças de estado de autenticação
  const handleAuthStateChange = useCallback((event: string, session: Session | null) => {
    if (!isMounted()) {
      console.log('[AuthContext] Component unmounted, ignoring auth state change');
      return;
    }

    console.log('[AuthContext] Auth state change:', event, session ? 'User present' : 'No user');

    // Evitar múltiplos eventos SIGNED_IN
    if (event === 'SIGNED_IN' && hasInitializedRef.current) {
      console.log('[AuthContext] Ignoring duplicate SIGNED_IN event');
      return;
    }

    // Evitar re-renders desnecessários usando functional updates
    setSession(prevSession => {
      if (prevSession?.access_token === session?.access_token) {
        return prevSession;
      }
      return session;
    });
    
    setUser(prevUser => {
      if (prevUser?.id === session?.user?.id) {
        return prevUser;
      }
      return session?.user ?? null;
    });
    
    setLoading(false);
    hasInitializedRef.current = true;
    console.log('[AuthContext] Loading set to false (auth state change)');
    
    // Se o usuário foi autenticado, garantir que tenha perfil (com debounce)
    if (session?.user && event === 'SIGNED_IN') {
      console.log('[AuthContext] User signed in, scheduling profile creation...');
      debouncedEnsureProfile(session.user);
    }
  }, [isMounted, debouncedEnsureProfile]);

  useEffect(() => {
    isMountedRef.current = true;
    loadingRef.current = false;
    hasInitializedRef.current = false;
    
    console.log('[AuthContext] Setting up auth context...');

    // Configurar listener para mudanças de estado
    const { data: { subscription: authSubscription } } = AuthService.onAuthStateChange(handleAuthStateChange);
    subscriptionRef.current = authSubscription;

    // Inicializar autenticação
    initializeAuth();
    
    // Fallback: garantir que loading seja false após 5 segundos
    fallbackTimeoutRef.current = setTimeout(() => {
      if (isMounted() && !hasInitializedRef.current) {
        console.warn('[AuthContext] Fallback: forcing loading to false');
        setLoading(false);
        hasInitializedRef.current = true;
      }
    }, 5000);
    
    // Cleanup function
    return () => {
      console.log('[AuthContext] Cleaning up auth context');
      isMountedRef.current = false;
      cleanup();
    };
  }, [initializeAuth, handleAuthStateChange, cleanup, isMounted]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isMounted()) {
      console.log('[AuthContext] Component unmounted, skipping login');
      return false;
    }

    try {
      setLoading(true);
      loadingRef.current = true;
      
      const credentials: LoginCredentials = { email, password };
      const { data: user, error } = await AuthService.login(credentials);
  
      if (!isMounted()) {
        console.log('[AuthContext] Component unmounted during login');
        return false;
      }

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Erro no login",
          description: error,
          variant: "destructive",
        });
        return false;
      }
  
      if (user) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao BarberTime!",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      if (isMounted()) {
        toast({
          title: "Erro no login",
          description: "Erro inesperado durante o login",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      if (isMounted()) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    if (!isMounted()) {
      console.log('[AuthContext] Component unmounted, skipping register');
      return false;
    }

    try {
      setLoading(true);
      loadingRef.current = true;
      
      const credentials: RegisterCredentials = { name, email, phone, password };
      const { data: user, error } = await AuthService.register(credentials);

      if (!isMounted()) {
        console.log('[AuthContext] Component unmounted during register');
        return false;
      }

      if (error) {
        console.error('Register error:', error);
        toast({
          title: "Erro no registro",
          description: error,
          variant: "destructive",
        });
        return false;
      }

      if (user) {
        toast({
          title: "Registro realizado com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[AuthContext] Register error:', error);
      if (isMounted()) {
        toast({
          title: "Erro no registro",
          description: "Erro inesperado durante o registro",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      if (isMounted()) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  };

  const logout = async () => {
    if (!isMounted()) {
      console.log('[AuthContext] Component unmounted, skipping logout');
      return;
    }

    try {
      setLoading(true);
      loadingRef.current = true;
      
      const { error } = await AuthService.logout();

      if (!isMounted()) {
        console.log('[AuthContext] Component unmounted during logout');
        return;
      }

      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Erro no logout",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado com sucesso!",
          description: "Até logo!",
        });
      }
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      if (isMounted()) {
        toast({
          title: "Erro no logout",
          description: "Erro inesperado durante o logout",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  };

  const isTrialExpired = async (): Promise<boolean> => {
    if (!isMounted() || !user) {
      return false;
    }

    try {
      return await AuthService.isTrialExpired();
    } catch (error) {
      console.error('[AuthContext] Error checking trial status:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    register,
    logout,
    isTrialExpired,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};