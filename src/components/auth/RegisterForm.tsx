
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Phone, Lock } from 'lucide-react';

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
    <div className="glass-card rounded-2xl p-8 backdrop-blur-xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-2xl">
          <img 
            src="/lovable-uploads/c508ab5e-7c1d-421f-b905-6c8b27ab36fe.png" 
            alt="BarberTime Logo" 
            className="w-12 h-12 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
        <p className="text-white/70">
          Comece seu período gratuito de 7 dias
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-white/90 font-medium">Nome completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={handleChange}
              className="w-full modern-input pl-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-white/90 font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full modern-input pl-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-white/90 font-medium">Telefone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={handleChange}
              className="w-full modern-input pl-12"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-white/90 font-medium">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              className="w-full modern-input pl-12"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-white/90 font-medium">Confirmar senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full modern-input pl-12"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full barber-button-primary py-4 text-lg font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-white/70">
          Já tem uma conta?{' '}
          <button
            onClick={onToggleMode}
            className="text-white font-semibold hover:text-white/80 transition-colors"
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
};
