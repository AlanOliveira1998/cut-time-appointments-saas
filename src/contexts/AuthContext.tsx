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
  // alias para compatibilidade com componentes que usam `signOut`
  signOut: () => Promise<void>;
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
  
  // Refs para controle de estado
  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para limpar recursos
  const cleanup = useCallback(() => {
    console.log('[AuthContext] Cleaning up resources...');
    
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
      console.log('[AuthContext] Auth subscription unsubscribed');
    }
  }, []);

  // Função para garantir que o usuário tenha um perfil
  const ensureUserProfile = useCallback(async (user: User) => {
    if (!isMountedRef.current || !user?.id) {
      console.log('[AuthContext] Skipping profile creation - component unmounted or no user');
      return;
    }

    try {
      console.log('[AuthContext] Ensuring profile for user:', user.id);
      
      const { data: profileExists, error: profileError } = await AuthService.checkProfileExists(user.id);
      
      if (profileError) {
        console.error('[AuthContext] Error checking profile:', profileError);
        return;
      }
      
      if (!profileExists) {
        console.log('[AuthContext] Profile does not exist, creating new one...');
        
        // Determinar status da assinatura baseado no email
        const subscriptionStatus = user.email === 'alan.pires.oliveira@gmail.com' ? 'active' : 'trial';
        
        const { error: createError } = await AuthService.createProfile({
          id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Novo Usuário',
          phone: user.user_metadata?.phone || '',
          subscription_status: subscriptionStatus,
          subscription_start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (createError) {
          console.error('[AuthContext] Error creating profile:', createError);
        } else {
          console.log('[AuthContext] Profile created successfully');
        }
      } else {
        console.log('[AuthContext] Profile already exists');
      }
    } catch (error) {
      console.error('[AuthContext] Error in ensureUserProfile:', error);
    }
  }, []);

  // Função para lidar com mudanças de estado de autenticação
  const handleAuthStateChange = useCallback((event: string, session: Session | null) => {
    if (!isMountedRef.current) {
      console.log('[AuthContext] Component unmounted, ignoring auth state change');
      return;
    }

    console.log('[AuthContext] Auth state change:', event, session ? 'User present' : 'No user');

    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
    
    // Se o usuário foi autenticado, garantir que tenha perfil
    if (session?.user && event === 'SIGNED_IN') {
      console.log('[AuthContext] User signed in, ensuring profile...');
      ensureUserProfile(session.user).catch((error) => {
        console.error('[AuthContext] Error in profile creation:', error);
      });
    }
  }, [ensureUserProfile]);

  // Inicialização simplificada
  useEffect(() => {
    isMountedRef.current = true;
    
    console.log('[AuthContext] Setting up auth context...');

    // Configurar listener para mudanças de estado
    const { data: { subscription: authSubscription } } = AuthService.onAuthStateChange(handleAuthStateChange);
    subscriptionRef.current = authSubscription;

    // Fallback: garantir que loading seja false após 3 segundos
    initTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.warn('[AuthContext] Fallback: forcing loading to false');
        setLoading(false);
      }
    }, 3000);
    
    // Cleanup function
    return () => {
      console.log('[AuthContext] Cleaning up auth context');
      isMountedRef.current = false;
      cleanup();
    };
  }, []); // Dependências vazias para evitar loops

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isMountedRef.current) {
      console.log('[AuthContext] Component unmounted, skipping login');
      return false;
    }

    try {
      setLoading(true);
      
      const credentials: LoginCredentials = { email, password };
      const { data: user, error } = await AuthService.login(credentials);
  
      if (!isMountedRef.current) {
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
      if (isMountedRef.current) {
        toast({
          title: "Erro no login",
          description: "Erro inesperado durante o login",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    if (!isMountedRef.current) {
      console.log('[AuthContext] Component unmounted, skipping register');
      return false;
    }

    try {
      setLoading(true);
      
      const credentials: RegisterCredentials = { name, email, phone, password };
      const { data: user, error } = await AuthService.register(credentials);

      if (!isMountedRef.current) {
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
      if (isMountedRef.current) {
        toast({
          title: "Erro no registro",
          description: "Erro inesperado durante o registro",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const logout = async () => {
    if (!isMountedRef.current) {
      console.log('[AuthContext] Component unmounted, skipping logout');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await AuthService.logout();

      if (!isMountedRef.current) {
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
      if (isMountedRef.current) {
        toast({
          title: "Erro no logout",
          description: "Erro inesperado durante o logout",
          variant: "destructive",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const isTrialExpired = async (): Promise<boolean> => {
    if (!isMountedRef.current || !user) {
      return false;
    }

    try {
      const result = await AuthService.isTrialExpired(user.id);
      return result.data ?? false;
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
    // fornecer alias para compatibilidade com código existente
    signOut: logout,
    isTrialExpired,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
