import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

export interface AuthServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Serviço de autenticação responsável por todas as operações de autenticação
 * com o Supabase. Separa a lógica de negócio da camada de apresentação.
 */
export class AuthService {
  /**
   * Obtém a sessão atual do usuário
   */
  static async getCurrentSession(): Promise<AuthServiceResponse<Session>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthService] Error getting session:', error);
        return { data: null, error: error.message };
      }
      
      return { data: session, error: null };
    } catch (error) {
      console.error('[AuthService] Unexpected error getting session:', error);
      return { data: null, error: 'Erro inesperado ao obter sessão' };
    }
  }

  /**
   * Realiza login do usuário
   */
  static async login(credentials: LoginCredentials): Promise<AuthServiceResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('[AuthService] Login error:', error);
        return { data: null, error: error.message };
      }

      return { data: data.user, error: null };
    } catch (error) {
      console.error('[AuthService] Unexpected login error:', error);
      return { data: null, error: 'Erro inesperado durante o login' };
    }
  }

  /**
   * Registra um novo usuário
   */
  static async register(credentials: RegisterCredentials): Promise<AuthServiceResponse<User>> {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: credentials.name,
            phone: credentials.phone,
          }
        }
      });

      if (error) {
        console.error('[AuthService] Register error:', error);
        return { data: null, error: error.message };
      }

      return { data: data.user, error: null };
    } catch (error) {
      console.error('[AuthService] Unexpected register error:', error);
      return { data: null, error: 'Erro inesperado durante o registro' };
    }
  }

  /**
   * Realiza logout do usuário
   */
  static async logout(): Promise<AuthServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthService] Logout error:', error);
        return { data: null, error: error.message };
      }

      return { data: undefined, error: null };
    } catch (error) {
      console.error('[AuthService] Unexpected logout error:', error);
      return { data: null, error: 'Erro inesperado durante o logout' };
    }
  }

  /**
   * Verifica se o período de teste do usuário expirou
   */
  static async isTrialExpired(userId: string): Promise<AuthServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('trial_expires_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthService] Error checking trial status:', error);
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: true, error: null }; // Se não há perfil, considera expirado
      }

      const trialExpired = data.trial_expires_at 
        ? new Date(data.trial_expires_at) < new Date()
        : true;

      return { data: trialExpired, error: null };
    } catch (error) {
      console.error('[AuthService] Unexpected error checking trial:', error);
      return { data: null, error: 'Erro inesperado ao verificar período de teste' };
    }
  }

  /**
   * Configura o listener de mudanças de estado de autenticação
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Obtém o usuário atual
   */
  static async getCurrentUser(): Promise<AuthServiceResponse<User>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('[AuthService] Error getting user:', error);
        return { data: null, error: error.message };
      }
      
      return { data: user, error: null };
    } catch (error) {
      console.error('[AuthService] Unexpected error getting user:', error);
      return { data: null, error: 'Erro inesperado ao obter usuário' };
    }
  }
}
