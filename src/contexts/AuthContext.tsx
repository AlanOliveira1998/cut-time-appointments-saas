
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
  isTrialExpired: () => boolean;
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao BarberTime! Seu período gratuito de 7 dias começou agora.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Limpar estado local primeiro
      setSession(null);
      setUser(null);
      
      // Limpar localStorage do Supabase
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('supabase.') || key.includes('sb-')
      );
      keys.forEach(key => localStorage.removeItem(key));
      
      // Tentar signOut apenas se há uma sessão
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== 'Auth session missing!') {
          console.error('Logout error:', error);
        }
      }
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      
      // Forçar redirecionamento para página inicial
      window.location.href = '/';
    } catch (error: any) {
      console.error('Logout error:', error);
      // Mesmo com erro, limpar estado e redirecionar
      setSession(null);
      setUser(null);
      window.location.href = '/';
    }
  };

  const isTrialExpired = (): boolean => {
    if (!user?.created_at) return false;
    
    const now = new Date();
    const createdDate = new Date(user.created_at);
    const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 7;
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
