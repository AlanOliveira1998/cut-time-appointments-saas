
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '../../../integrations/supabase/client';

export interface Service {
  id: string;
  barber_id: string;
  name: string;
  duration: number;
  price: number;
  created_at: string;
}

export interface WorkingHour {
  id: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  barber_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

export const useBookingData = (barberId: string | undefined) => {
  const [barber, setBarber] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to check if a string looks like a UUID
  const isUUID = useCallback((str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }, []);

  const loadBarberData = useCallback(async () => {
    if (!barberId) return;
    
    try {
      setLoading(true);
      
      let barberData, barberError;
      
      // Check if barberId looks like a UUID
      if (isUUID(barberId)) {
        // Search by ID
        const result = await supabase
          .from('barbers')
          .select(`
            *,
            profiles (
              id,
              name,
              phone,
              created_at
            )
          `)
          .eq('id', barberId)
          .single();
        
        barberData = result.data;
        barberError = result.error;
      } else {
        // Search by name (either in profiles.name or employee_name)
        
        // First try to find by employee_name
        let result = await supabase
          .from('barbers')
          .select(`
            *,
            profiles (
              id,
              name,
              phone,
              created_at
            )
          `)
          .ilike('employee_name', `%${barberId}%`)
          .eq('is_active', true);
        
        // If not found by employee_name, try by profiles.name
        if (!result.data || result.data.length === 0) {
          result = await supabase
            .from('barbers')
            .select(`
              *,
              profiles (
                id,
                name,
                phone,
                created_at
              )
            `)
            .ilike('profiles.name', `%${barberId}%`)
            .eq('is_active', true);
        }
        
        // Take the first result if found
        barberData = result.data && result.data.length > 0 ? result.data[0] : null;
        barberError = result.error;
      }

      if (barberError) {
        console.error('Error loading barber:', barberError);
        toast({
          title: "Erro ao carregar barbeiro",
          description: barberError.message,
          variant: "destructive",
        });
        return;
      }

      if (!barberData) {
        toast({
          title: "Barbeiro não encontrado",
          description: "O barbeiro solicitado não foi encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Para funcionários, usar os dados do employee_name, para owners usar o profile
      let barberProfile: Profile;
      if (barberData.role === 'employee') {
        barberProfile = {
          id: barberData.id, // Sempre usar o ID do barber, não do profile
          name: barberData.employee_name || 'Nome não informado',
          phone: barberData.employee_phone || '',
          created_at: barberData.created_at
        };
      } else {
        barberProfile = {
          id: barberData.id, // Sempre usar o ID do barber, não do profile
          name: barberData.profiles?.name || 'Nome não informado',
          phone: barberData.profiles?.phone || '',
          created_at: barberData.created_at
        };
      }

      setBarber(barberProfile);
      
      // Carregar serviços do barbeiro
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('barber_id', barberData.id);

      if (servicesError) {
        console.error('Error loading services:', servicesError);
      } else {
        setServices(servicesData || []);
      }
      
      // Carregar horários de funcionamento
      const { data: workingHoursData, error: workingHoursError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('barber_id', barberData.id);

      if (workingHoursError) {
        console.error('Error loading working hours:', workingHoursError);
      } else {
        setWorkingHours(workingHoursData || []);
      }
      
    } catch (error) {
      console.error('Error loading barber data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar os dados do barbeiro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [barberId, isUUID]);

  const loadAppointments = useCallback(async (barberId: string, selectedDate: string) => {
    if (!selectedDate) return;

    try {
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .eq('appointment_date', selectedDate)
        .neq('status', 'cancelled');

      if (error) {
        console.error('Error loading appointments:', error);
      } else {
        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }, []);

  // Memoize the return value to prevent unnecessary re-renders
  const memoizedValue = useMemo(() => ({
    barber,
    services,
    workingHours,
    appointments,
    loading,
    loadAppointments,
    setAppointments
  }), [barber, services, workingHours, appointments, loading, loadAppointments]);

  useEffect(() => {
    loadBarberData();
  }, [loadBarberData]);

  return memoizedValue;
};
