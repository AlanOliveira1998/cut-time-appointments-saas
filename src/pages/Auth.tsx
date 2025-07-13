
import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Card, CardContent } from '../components/ui/card';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <Card className="barber-card animate-fade-in-up">
          <CardContent className="p-6 sm:p-8">
            {/* Logo e Título */}
            <div className="text-center mb-8">
              {/* Logo removido */}
              <h1 className="barber-title text-center">
                {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
              </h1>
              <p className="text-gray-600 text-sm">
                {isLogin 
                  ? 'Entre no BarberTime para gerenciar seus agendamentos' 
                  : 'Comece a usar o BarberTime gratuitamente por 7 dias'
                }
              </p>
            </div>

            {/* Formulários */}
            {isLogin ? <LoginForm onToggleMode={toggleMode} /> : <RegisterForm onToggleMode={toggleMode} />}

            {/* Toggle entre Login/Registro */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button
                  onClick={toggleMode}
                  className="ml-1 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {isLogin ? 'Criar conta' : 'Fazer login'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-primary hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
