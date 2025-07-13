import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
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

    const initializeAuth = async () => {
      try {
        // Primeiro, pegar a sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Configurar listener para mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Só definir loading como false após a inicialização completa
          if (loading) {
            setLoading(false);
          }
        }
      }
    );

    // Inicializar autenticação
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
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

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            phone,
          }
        }
      });

      if (error) {
        console.error('Register error:', error);
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        // Verificar se o usuário precisa confirmar email
        if (data.user.email_confirmed_at) {
          toast({
            title: "Conta criada com sucesso!",
            description: "Bem-vindo ao BarberTime! Seu período gratuito de 7 dias começou agora.",
          });
        } else {
          toast({
            title: "Conta criada!",
            description: "Verifique seu email para confirmar a conta.",
          });
        }
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
      
      // Usar o signOut do Supabase que já limpa tudo corretamente
      const { error } = await supabase.auth.signOut();
      
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
      // Verificar status da assinatura no banco
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_end_date')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking subscription status:', error);
        // Fallback para verificação antiga
        return checkTrialByDate();
      }

      // Se tem assinatura ativa, não expirou
      if (profile?.subscription_status === 'active') {
        return false;
      }

      // Se tem assinatura cancelada ou expirada, verificar se ainda está no período
      if (profile?.subscription_end_date) {
        const endDate = new Date(profile.subscription_end_date);
        if (endDate > new Date()) {
          return false; // Ainda válida
        }
      }

      // Fallback para verificação por data de criação
      return checkTrialByDate();
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