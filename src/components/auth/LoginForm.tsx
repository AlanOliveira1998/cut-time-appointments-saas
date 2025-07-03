
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao BarberTime",
        });
      } else {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 backdrop-blur-xl max-w-md w-full">
      <div className="text-center mb-8">
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
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Entrar</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <input
              id="email"
              type="email"
              placeholder="Endereço de Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full modern-input"
              required
            />
          </div>
          
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full modern-input pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <button className="text-slate-600 hover:text-slate-800 transition-colors">
          Esqueceu a senha?
        </button>
        
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={onToggleMode}
            className="text-slate-600 hover:text-slate-800 transition-colors"
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
};
