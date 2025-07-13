
import { useState, useEffect, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '../../../integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type WorkingHour = Tables<'working_hours'>;

interface Barber {
  id: string;
  profile_id: string | null;
  specialty?: string;
  experience_years: number;
  is_active: boolean;
  role: 'owner' | 'employee';
  employee_name?: string;
  employee_phone?: string;
  profiles?: {
    name: string;
    phone?: string;
  } | null;
  working_hours?: WorkingHour[];
}

export const useBarbers = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'owner' | 'employee'>('all');

  const loadBarbers = async () => {
    try {
      setLoading(true);
      console.log('Carregando barbeiros ativos...');
      
      // Primeiro, carregar barbeiros
      const { data: barbersData, error: barbersError } = await supabase
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

      console.log('Dados dos barbeiros carregados:', barbersData);
      console.log('Erro dos barbeiros:', barbersError);

      if (barbersError) {
        console.error('Error loading barbers:', barbersError);
        toast({
          title: "Erro ao carregar barbeiros",
          description: barbersError.message,
          variant: "destructive",
        });
        return;
      }

      // Depois, carregar horários de trabalho para todos os barbeiros
      const { data: workingHoursData, error: workingHoursError } = await supabase
        .from('working_hours')
        .select('*')
        .order('day_of_week');

      console.log('Dados dos horários carregados:', workingHoursData);
      console.log('Erro dos horários:', workingHoursError);

      if (workingHoursError) {
        console.error('Error loading working hours:', workingHoursError);
        // Não mostrar erro para o usuário, apenas log
      }

      // Combinar dados dos barbeiros com seus horários
      const barbersWithHours = (barbersData || []).map(barber => ({
        ...barber,
        working_hours: (workingHoursData || []).filter(
          hour => hour.barber_id === barber.id
        )
      }));

      console.log('Barbeiros carregados com horários:', barbersWithHours);
      setBarbers(barbersWithHours as Barber[]);
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

  // Filtrar barbeiros baseado na busca e filtros
  const filteredBarbers = useMemo(() => {
    return barbers.filter(barber => {
      const barberName = barber.profiles?.name || barber.employee_name || '';
      const barberSpecialty = barber.specialty || '';
      
      // Filtro por busca
      const matchesSearch = searchTerm === '' || 
        barberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barberSpecialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por role
      const matchesRole = filterRole === 'all' || barber.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  }, [barbers, searchTerm, filterRole]);

  // Estatísticas dos barbeiros
  const barberStats = useMemo(() => {
    const total = barbers.length;
    const owners = barbers.filter(b => b.role === 'owner').length;
    const employees = barbers.filter(b => b.role === 'employee').length;
    
    return { total, owners, employees };
  }, [barbers]);

  useEffect(() => {
    loadBarbers();
  }, []);

  return {
    barbers,
    filteredBarbers,
    loading,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    barberStats,
    loadBarbers
  };
};
