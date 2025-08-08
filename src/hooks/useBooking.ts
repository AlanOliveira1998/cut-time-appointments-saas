import { useState, useCallback, useEffect, useMemo } from 'react';
import { BookingService, Barber, Service, WorkingHour, Appointment } from '../services/bookingService';
import { toast } from './use-toast';

/**
 * Hook personalizado para gerenciar dados de agendamento
 * Separa a lógica de estado da comunicação com a API
 */
export const useBooking = (barberId: string | undefined) => {
  const [barber, setBarber] = useState<Barber | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega todos os dados do barbeiro (perfil, serviços, horários)
   */
  const loadBarberData = useCallback(async () => {
    if (!barberId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados do barbeiro
      const { data: barberData, error: barberError } = await BookingService.getBarberData(barberId);
      
      if (barberError) {
        console.error('[useBooking] Error loading barber data:', barberError);
        setError(barberError);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados do barbeiro.",
          variant: "destructive",
        });
        return;
      }

      if (barberData) {
        setBarber(barberData);
        
        // Carregar serviços do barbeiro
        const { data: servicesData, error: servicesError } = await BookingService.getBarberServices(barberData.id);
        
        if (servicesError) {
          console.error('[useBooking] Error loading services:', servicesError);
          setError(servicesError);
        } else {
          setServices(servicesData || []);
        }

        // Carregar horários de trabalho
        const { data: workingHoursData, error: workingHoursError } = await BookingService.getWorkingHours(barberData.id);
        
        if (workingHoursError) {
          console.error('[useBooking] Error loading working hours:', workingHoursError);
          setError(workingHoursError);
        } else {
          setWorkingHours(workingHoursData || []);
        }
      }
    } catch (error) {
      console.error('[useBooking] Unexpected error loading barber data:', error);
      setError('Erro inesperado ao carregar dados');
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro inesperado ao carregar os dados do barbeiro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [barberId]);

  /**
   * Carrega agendamentos para uma data específica
   */
  const loadAppointments = useCallback(async (selectedDate: string) => {
    if (!barberId || !selectedDate) return;

    try {
      const { data: appointmentsData, error } = await BookingService.getAppointments(barberId, selectedDate);

      if (error) {
        console.error('[useBooking] Error loading appointments:', error);
        setError(error);
      } else {
        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('[useBooking] Unexpected error loading appointments:', error);
      setError('Erro inesperado ao carregar agendamentos');
    }
  }, [barberId]);

  /**
   * Cria um novo agendamento
   */
  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: newAppointment, error } = await BookingService.createAppointment(appointmentData);

      if (error) {
        console.error('[useBooking] Error creating appointment:', error);
        setError(error);
        toast({
          title: "Erro ao criar agendamento",
          description: error,
          variant: "destructive",
        });
        return null;
      }

      // Adicionar o novo agendamento à lista
      if (newAppointment) {
        setAppointments(prev => [...prev, newAppointment]);
      }

      toast({
        title: "Agendamento criado com sucesso!",
        description: "Seu horário foi reservado.",
      });

      return newAppointment;
    } catch (error) {
      console.error('[useBooking] Unexpected error creating appointment:', error);
      setError('Erro inesperado ao criar agendamento');
      toast({
        title: "Erro ao criar agendamento",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza um agendamento existente
   */
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: updatedAppointment, error } = await BookingService.updateAppointment(id, updates);

      if (error) {
        console.error('[useBooking] Error updating appointment:', error);
        setError(error);
        toast({
          title: "Erro ao atualizar agendamento",
          description: error,
          variant: "destructive",
        });
        return null;
      }

      // Atualizar o agendamento na lista
      if (updatedAppointment) {
        setAppointments(prev => 
          prev.map(apt => apt.id === id ? updatedAppointment : apt)
        );
      }

      toast({
        title: "Agendamento atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });

      return updatedAppointment;
    } catch (error) {
      console.error('[useBooking] Unexpected error updating appointment:', error);
      setError('Erro inesperado ao atualizar agendamento');
      toast({
        title: "Erro ao atualizar agendamento",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancela um agendamento
   */
  const cancelAppointment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: cancelledAppointment, error } = await BookingService.cancelAppointment(id);

      if (error) {
        console.error('[useBooking] Error cancelling appointment:', error);
        setError(error);
        toast({
          title: "Erro ao cancelar agendamento",
          description: error,
          variant: "destructive",
        });
        return false;
      }

      // Atualizar o agendamento na lista
      if (cancelledAppointment) {
        setAppointments(prev => 
          prev.map(apt => apt.id === id ? cancelledAppointment : apt)
        );
      }

      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('[useBooking] Unexpected error cancelling appointment:', error);
      setError('Erro inesperado ao cancelar agendamento');
      toast({
        title: "Erro ao cancelar agendamento",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtém estatísticas de agendamentos
   */
  const getAppointmentStats = useCallback(async (startDate: string, endDate: string) => {
    if (!barberId) return null;

    try {
      const { data: stats, error } = await BookingService.getAppointmentStats(barberId, startDate, endDate);

      if (error) {
        console.error('[useBooking] Error getting appointment stats:', error);
        setError(error);
        return null;
      }

      return stats;
    } catch (error) {
      console.error('[useBooking] Unexpected error getting appointment stats:', error);
      setError('Erro inesperado ao obter estatísticas');
      return null;
    }
  }, [barberId]);

  // Memoizar o valor de retorno para evitar re-renders desnecessários
  const memoizedValue = useMemo(() => ({
    barber,
    services,
    workingHours,
    appointments,
    loading,
    error,
    loadAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAppointmentStats,
    setAppointments
  }), [
    barber,
    services,
    workingHours,
    appointments,
    loading,
    error,
    loadAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAppointmentStats
  ]);

  // Carregar dados do barbeiro quando o ID mudar
  useEffect(() => {
    loadBarberData();
  }, [loadBarberData]);

  return memoizedValue;
};
