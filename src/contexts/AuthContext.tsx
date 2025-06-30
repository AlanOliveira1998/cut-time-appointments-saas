
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';

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

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const storedUser = localStorage.getItem('barbertime_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser({
        ...userData,
        createdAt: new Date(userData.createdAt)
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simular busca no banco de dados
      const users = JSON.parse(localStorage.getItem('barbertime_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData = {
          ...foundUser,
          createdAt: new Date(foundUser.createdAt)
        };
        delete userData.password; // Remover senha dos dados do usuário
        
        setUser(userData);
        localStorage.setItem('barbertime_user', JSON.stringify(userData));
        return true;
      }
      return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      // Verificar se o email já existe
      const users = JSON.parse(localStorage.getItem('barbertime_users') || '[]');
      const emailExists = users.some((u: any) => u.email === email);
      
      if (emailExists) {
        return false;
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        password,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      users.push(newUser);
      localStorage.setItem('barbertime_users', JSON.stringify(users));

      // Fazer login automático
      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: new Date(newUser.createdAt),
        isActive: newUser.isActive
      };

      setUser(userData);
      localStorage.setItem('barbertime_user', JSON.stringify(userData));
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('barbertime_user');
  };

  const isTrialExpired = (): boolean => {
    if (!user) return false;
    
    const now = new Date();
    const createdDate = new Date(user.createdAt);
    const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 7;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isTrialExpired }}>
      {children}
    </AuthContext.Provider>
  );
};
