import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useBarberProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isBarber, setIsBarber] = useState(false);
  const [barberProfile, setBarberProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBarberProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('barbers')
          .select('*')
          .eq('profile_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching barber profile:', error);
          setError(error.message);
          setIsBarber(false);
        } else if (data) {
          setBarberProfile(data);
          setIsBarber(true);
          setError(null);
        } else {
          setIsBarber(false);
          setError('Perfil de barbeiro não encontrado');
        }
      } catch (err) {
        console.error('Error in barber profile check:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setIsBarber(false);
      } finally {
        setLoading(false);
      }
    };

    checkBarberProfile();
  }, [user?.id]);

  return { loading, isBarber, barberProfile, error };
}