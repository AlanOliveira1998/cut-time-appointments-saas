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
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Initializing authentication...');
        
        // Adicionar timeout para evitar travamento
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Auth initialization timeout')), 10000);
        });
        
        const sessionPromise = AuthService.getCurrentSession();
        
        const { data: session, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
        }
        
        if (mounted) {
          console.log('[AuthContext] Session loaded:', session ? 'User logged in' : 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Sempre definir loading como false após a inicialização
          setLoading(false);
          console.log('[AuthContext] Loading set to false');
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          console.log('[AuthContext] Loading set to false (error case)');
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    // Configurar listener para mudanças de estado
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state change:', event, session ? 'User present' : 'No user');
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Se o usuário foi autenticado, garantir que tenha perfil
          if (session?.user && event === 'SIGNED_IN') {
            console.log('[AuthContext] User signed in, ensuring profile...');
            await ensureUserProfile(session.user);
          }
        }
      }
    );

    // Inicializar autenticação
    initializeAuth();
    
    // Fallback: garantir que loading seja false após 15 segundos
    const fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[AuthContext] Fallback: forcing loading to false');
        setLoading(false);
      }
    }, 15000);
    
    // Cleanup function
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      clearTimeout(fallbackTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  // Função para garantir que o usuário tenha um perfil
  const ensureUserProfile = async (user: User) => {
    try {
      // Verificar se o perfil já existe usando o AuthService
      const { data: profileExists, error: profileError } = await AuthService.checkProfileExists(user.id);
      
      if (profileError) {
        console.error('[AuthContext] Error checking profile:', profileError);
        return;
      }
      
      if (!profileExists) {
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
        }
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