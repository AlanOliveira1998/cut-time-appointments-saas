
import { useState, useEffect } from 'react';
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

  const loadBarberData = async () => {
    if (!barberId) return;
    
    try {
      setLoading(true);
      console.log('Carregando dados do barbeiro:', barberId);
      
      // Buscar barbeiro pelo ID
      const { data: barberData, error: barberError } = await supabase
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

      console.log('Resultado da busca de barbeiro:', barberData, barberError);

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
        console.log('Nenhum barbeiro encontrado');
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
          id: barberData.id,
          name: barberData.employee_name || 'Nome não informado',
          phone: barberData.employee_phone || '',
          created_at: barberData.created_at
        };
      } else {
        barberProfile = barberData.profiles || {
          id: barberData.id,
          name: 'Nome não informado',
          phone: '',
          created_at: barberData.created_at
        };
      }

      console.log('Barbeiro encontrado:', barberProfile);
      setBarber(barberProfile);
      
      // Carregar serviços do barbeiro
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('barber_id', barberId);

      console.log('Serviços carregados:', servicesData, servicesError);

      if (servicesError) {
        console.error('Error loading services:', servicesError);
      } else {
        setServices(servicesData || []);
      }
      
      // Carregar horários de funcionamento
      const { data: workingHoursData, error: workingHoursError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('barber_id', barberId);

      console.log('Horários carregados:', workingHoursData, workingHoursError);

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
  };

  const loadAppointments = async (barberId: string, selectedDate: string) => {
    if (!selectedDate) return;

    try {
      console.log('Carregando agendamentos para:', barberId, selectedDate);
      
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .eq('appointment_date', selectedDate)
        .neq('status', 'cancelled');

      console.log('Agendamentos carregados:', appointmentsData, error);

      if (error) {
        console.error('Error loading appointments:', error);
      } else {
        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  useEffect(() => {
    loadBarberData();
  }, [barberId]);

  return {
    barber,
    services,
    workingHours,
    appointments,
    loading,
    loadAppointments,
    setAppointments
  };
};
