import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Barber {
  id: string;
  profile_id: string | null;
  specialty?: string;
  experience_years: number;
  is_active: boolean;
  owner_id?: string;
  role: 'owner' | 'employee';
  employee_name?: string;
  employee_phone?: string;
  profiles?: {
    name: string;
    phone?: string;
  } | null;
}

export const useBarbers = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando barbeiros...');
      
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profiles (
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar barbeiros:', error);
        throw error;
      }
      
      console.log('✅ Barbeiros carregados:', data?.length || 0);
      setBarbers((data || []) as Barber[]);
    } catch (err: any) {
      console.error('💥 Erro ao buscar barbeiros:', err);
      setError(err.message || 'Erro ao carregar barbeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const refreshBarbers = () => {
    fetchBarbers();
  };

  return {
    barbers,
    loading,
    error,
    refreshBarbers
  };
};
