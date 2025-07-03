
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro no cadastro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(formData.name, formData.email, formData.phone, formData.password);
      if (success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao BarberTime! Seu período gratuito de 7 dias começou agora.",
        });
      } else {
        toast({
          title: "Erro no cadastro",
          description: "Este email já está em uso",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
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
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Criar Conta</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Nome Completo"
            value={formData.name}
            onChange={handleChange}
            className="w-full modern-input"
            required
          />
        </div>

        <div>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Endereço de Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full modern-input"
            required
          />
        </div>

        <div>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Número de Telefone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full modern-input"
            required
          />
        </div>
        
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Senha (mín. 6 caracteres)"
            value={formData.password}
            onChange={handleChange}
            className="w-full modern-input pr-12"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar Senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full modern-input pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Criando Conta...' : 'Criar Conta'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <div className="border-t border-gray-200 pt-4">
          <span className="text-slate-600">Já tem uma conta? </span>
          <button
            onClick={onToggleMode}
            className="text-slate-600 hover:text-slate-800 transition-colors font-semibold"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};
