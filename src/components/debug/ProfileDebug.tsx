import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const ProfileDebug: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const checkProfile = async () => {
    if (!user) {
      setResult('Nenhum usuário autenticado');
      return;
    }

    setLoading(true);
    setResult('Verificando perfil...');

    try {
      // Verificar se o perfil existe
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        setResult('Perfil não encontrado. Tentando criar...');
        
        // Criar o perfil
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.user_metadata?.full_name || 'Novo Usuário',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            subscription_status: 'trial',
            subscription_start_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();

        if (createError) {
          setResult(`Erro ao criar perfil: ${createError.message}`);
        } else {
          setResult(`Perfil criado com sucesso! ID: ${newProfile.id}`);
        }
      } else if (profileError) {
        setResult(`Erro ao verificar perfil: ${profileError.message}`);
      } else {
        setResult(`Perfil encontrado: ${profile.name} (${profile.id})`);
      }
    } catch (error: any) {
      setResult(`Erro geral: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRLS = async () => {
    setLoading(true);
    setResult('Testando políticas RLS...');

    try {
      const testUserId = 'test-user-' + Date.now();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          name: 'Test User',
          email: 'test@example.com',
          phone: '',
          subscription_status: 'trial',
          subscription_start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        setResult(`Erro ao testar inserção: ${error.message}`);
      } else {
        setResult(`Teste de inserção bem-sucedido! ID: ${data.id}`);
        
        // Limpar o perfil de teste
        await supabase
          .from('profiles')
          .delete()
          .eq('id', testUserId);
      }
    } catch (error: any) {
      setResult(`Erro ao testar RLS: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Debug - Perfil do Usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p><strong>Usuário ID:</strong> {user?.id || 'Nenhum'}</p>
          <p><strong>Email:</strong> {user?.email || 'Nenhum'}</p>
          <p><strong>Auth Loading:</strong> {authLoading ? 'Sim' : 'Não'}</p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={checkProfile} 
            disabled={loading || !user}
            className="w-full"
          >
            {loading ? 'Verificando...' : 'Verificar/Criar Perfil'}
          </Button>
          
          <Button 
            onClick={testRLS} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Testando...' : 'Testar Políticas RLS'}
          </Button>
        </div>
        
        {result && (
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-sm whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 