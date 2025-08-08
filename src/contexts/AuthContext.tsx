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
    console.log('[AuthContext] Initializing auth...');

    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Getting current session...');
        const { data: session, error } = await AuthService.getCurrentSession();
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
        } else {
          console.log('[AuthContext] Current session:', session ? 'Found' : 'None');
        }
        
        if (mounted) {
          console.log('[AuthContext] Setting session and user state', { 
            hasSession: !!session,
            hasUser: !!session?.user 
          });
          setSession(session);
          setUser(session?.user ?? null);
          
          // Se não há sessão, definir loading como false imediatamente
          if (!session) {
            console.log('[AuthContext] No session found, setting loading to false');
            setLoading(false);
          }
          // Se há sessão, o loading será definido como false no listener
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
        if (mounted) {
          console.log('[AuthContext] Error occurred, setting loading to false');
          setLoading(false);
        }
      }
    };

    // Configurar listener para mudanças de estado
    console.log('[AuthContext] Setting up auth state change listener');
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', { 
          event, 
          sessionId: session?.user?.id,
          hasUser: !!session?.user
        });
        
        if (mounted) {
          console.log('[AuthContext] Updating auth state', { 
            hasSession: !!session,
            hasUser: !!session?.user 
          });
          setSession(session);
          setUser(session?.user ?? null);
          
          // Se o usuário foi autenticado, garantir que tenha perfil
          if (session?.user && event === 'SIGNED_IN') {
            await ensureUserProfile(session.user);
          }
          
          // Sempre definir loading como false após processar a mudança de estado
          console.log('[AuthContext] Setting loading to false');
          setLoading(false);
        }
      }
    );

    // Inicializar autenticação
    initializeAuth();

    // Timeout de segurança para garantir que o loading não fique preso
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('[AuthContext] Safety timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 5000); // 5 segundos

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Logging in with email:', email);
      setLoading(true);
      
      const credentials: LoginCredentials = { email, password };
      const { data: user, error } = await AuthService.login(credentials);
      
      console.log('[AuthContext] Login response:', { 
        hasUser: !!user,
        error: error 
      });

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
        // Verificar se o usuário tem perfil, se não tiver, criar um
        await ensureUserProfile(user);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao BarberTime",
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

  // Função para garantir que o usuário tenha um perfil
  const ensureUserProfile = async (user: User) => {
    try {
      console.log('[AuthContext] Ensuring user profile exists for:', user.id);
      
      // Verificar se o perfil já existe
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Perfil não existe, criar um
        console.log('[AuthContext] Profile not found, creating new profile');
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
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
          // Não mostrar erro para o usuário, apenas log
        } else {
          console.log('[AuthContext] Profile created successfully');
        }
      } else if (profileError) {
        console.error('[AuthContext] Error checking profile:', profileError);
      } else {
        console.log('[AuthContext] Profile already exists');
      }
    } catch (error) {
      console.error('[AuthContext] Error in ensureUserProfile:', error);
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
        // Mesmo com erro, limpar o estado local
      }
      
      // Limpar estado local
      setSession(null);
      setUser(null);
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      
      // Redirecionar para página inicial
      window.location.href = '/';
    } catch (error: unknown) {
      console.error('Logout error:', error);
      // Mesmo com erro, limpar estado e redirecionar
      setSession(null);
      setUser(null);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const isTrialExpired = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    // Exceção para o usuário de teste
    if (user.email === "alan.pires.oliveira@gmail.com") {
      console.log('Usuário de teste detectado - trial sempre válido');
      return false;
    }
    
    try {
      const { data: trialExpired, error } = await AuthService.isTrialExpired(user.id);
      
      if (error) {
        console.error('Error checking trial expiration:', error);
        // Fallback para verificação antiga
        return checkTrialByDate();
      }

      return trialExpired;
    } catch (error) {
      console.error('Error checking trial expiration:', error);
      return checkTrialByDate();
    }
  };

  // Função auxiliar para verificar trial por data (fallback)
  const checkTrialByDate = (): boolean => {
    if (!user?.created_at) return false;
    
    try {
      const now = new Date();
      const createdDate = new Date(user.created_at);
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysDiff >= 7;
    } catch (error) {
      console.error('Error checking trial by date:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      register, 
      logout, 
      isTrialExpired, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};