import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;
    let hasInitialized = false;

    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Initializing authentication...');
        
        const { data: session, error } = await AuthService.getCurrentSession();
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
        }
        
        if (mounted) {
          console.log('[AuthContext] Session loaded:', session ? 'User logged in' : 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          hasInitialized = true;
          console.log('[AuthContext] Loading set to false (initialization)');
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          hasInitialized = true;
          console.log('[AuthContext] Loading set to false (error case)');
        }
      }
    };

    // Configurar listener para mudanças de estado - SEM async/await
    const { data: { subscription: authSubscription } } = AuthService.onAuthStateChange(
      (event, session) => {
        console.log('[AuthContext] Auth state change:', event, session ? 'User present' : 'No user');
        
        if (!mounted) {
          console.log('[AuthContext] Component unmounted, ignoring auth state change');
          return;
        }

        // Evitar múltiplos eventos SIGNED_IN
        if (event === 'SIGNED_IN' && hasInitialized) {
          console.log('[AuthContext] Ignoring duplicate SIGNED_IN event');
          return;
        }

        // Evitar re-renders desnecessários
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
        hasInitialized = true;
        console.log('[AuthContext] Loading set to false (auth state change)');
        
        // Se o usuário foi autenticado, garantir que tenha perfil
        if (session?.user && event === 'SIGNED_IN') {
          console.log('[AuthContext] User signed in, ensuring profile...');
          // Usar setTimeout para tornar a chamada assíncrona e evitar retornar Promise
          setTimeout(() => {
            if (mounted) {
              ensureUserProfile(session.user).catch((error) => {
                console.error('[AuthContext] Error ensuring profile:', error);
              });
            }
          }, 0);
        }
      }
    );

    subscription = authSubscription;

    // Inicializar autenticação
    initializeAuth();
    
    // Fallback: garantir que loading seja false após 3 segundos
    const fallbackTimeout = setTimeout(() => {
      if (mounted && !hasInitialized) {
        console.warn('[AuthContext] Fallback: forcing loading to false');
        setLoading(false);
        hasInitialized = true;
      }
    }, 3000);
    
    // Cleanup function
    return () => {
      console.log('[AuthContext] Cleaning up auth context');
      mounted = false;
      clearTimeout(fallbackTimeout);
      if (subscription) {
        subscription.unsubscribe();
        console.log('[AuthContext] Auth subscription unsubscribed');
      }
    };
  }, []);

  // Função para garantir que o usuário tenha um perfil
  const ensureUserProfile = async (user: User) => {
    try {
      console.log('[AuthContext] Ensuring profile for user:', user.id);
      
      // Verificar se o perfil já existe usando o AuthService
      const { data: profileExists, error: profileError } = await AuthService.checkProfileExists(user.id);
      
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
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const credentials: LoginCredentials = { email, password };
      const { data: user, error } = await AuthService.login(credentials);
  
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
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const credentials: RegisterCredentials = { name, email, phone, password };
      const { data: user, error } = await AuthService.register(credentials);
  
      if (error) {
        console.error('Register error:', error);
        toast({
          title: "Erro no cadastro",
          description: error,
          variant: "destructive",
        });
        return false;
      }
  
      // O perfil será criado automaticamente pelo trigger no banco de dados
      // Então não precisamos fazer nada aqui
  
      if (user) {
        toast({
          title: "Conta criada com sucesso!",
          description: user.email_confirmed_at 
            ? "Bem-vindo ao BarberTime! Seu período gratuito de 7 dias começou agora."
            : "Verifique seu email para confirmar a conta.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      const { error } = await AuthService.logout();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Erro no logout",
          description: "Ocorreu um erro ao fazer logout. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isTrialExpired = async (): Promise<boolean> => {
    try {
      return await AuthService.isTrialExpired();
    } catch (error) {
      console.error('Error checking trial status:', error);
      return false;
    }
  };

  // Função auxiliar para verificar trial por data (fallback)
  const checkTrialByDate = (): boolean => {
    if (!user) return false;
    
    // Esta é uma verificação básica por data
    // Em produção, você deve usar a função isTrialExpired() que consulta o banco
    const trialStart = user.created_at ? new Date(user.created_at) : new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 7); // 7 dias de trial
    
    return new Date() > trialEnd;
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