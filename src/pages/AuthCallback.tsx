import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Processar o callback do OAuth
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Erro na autenticação",
            description: "Ocorreu um erro ao fazer login com Google. Tente novamente.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (data.session) {
          // Verificar se o usuário já tem perfil
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Usuário não tem perfil, criar um
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || 'Usuário',
                phone: data.session.user.user_metadata?.phone || null,
                subscription_status: 'trial',
                subscription_start_date: new Date().toISOString(),
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
            }
          }

          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao BarberTime!",
          });

          // Redirecionar para o dashboard
          navigate('/dashboard');
        } else {
          // Sem sessão, redirecionar para login
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Erro na autenticação",
          description: "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive",
        });
        navigate('/auth');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="glass-card rounded-2xl p-8 backdrop-blur-xl max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mr-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-slate-800 rounded-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-white to-blue-500 rounded-full transform rotate-45"></div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">BarberTime</h1>
        </div>
        
        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-slate-800">Processando login...</h2>
            <p className="text-slate-600">Aguarde um momento enquanto configuramos sua conta.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Login realizado!</h2>
            <p className="text-slate-600">Redirecionando para o dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}; 