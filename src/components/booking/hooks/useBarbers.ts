import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '../../../integrations/supabase/client';

interface Barber {
  id: string;
  profile_id: string;
  specialty?: string;
  experience_years: number;
  is_active: boolean;
  profiles: {
    name: string;
    phone?: string;
  };
}

export const useBarbers = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBarbers = async () => {
    try {
      setLoading(true);
      console.log('Carregando barbeiros...');
      
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profiles (
            name,
            phone
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Barbeiros carregados:', data, error);

      if (error) {
        console.error('Error loading barbers:', error);
        toast({
          title: "Erro ao carregar barbeiros",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setBarbers(data || []);
    } catch (error) {
      console.error('Error loading barbers:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar os barbeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarbers();
  }, []);

  return {
    barbers,
    loading,
    loadBarbers
  };
};