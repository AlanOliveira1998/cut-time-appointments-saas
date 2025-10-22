import { supabase } from '../integrations/supabase/client';

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface Profile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  barber_id: string;
}

export interface WorkingHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
  barber_id: string;
}

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  service_id: string;
  barber_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface Barber {
  id: string;
  profile_id: string | null;
  specialty?: string;
  experience_years: number;
  is_active: boolean;
  role: 'owner' | 'employee';
  employee_name?: string;
  employee_phone?: string;
  profiles?: Profile | null;
}

/**
 * Serviço de agendamento responsável por todas as operações relacionadas
 * a agendamentos, barbeiros, serviços e horários de trabalho.
 */
export class BookingService {
  /**
   * Obtém dados do barbeiro por ID ou nome
   */
  static async getBarberData(barberId: string): Promise<ServiceResponse<Barber>> {
    try {
      // Verifica se é um UUID válido
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(barberId);
      
      let query = supabase
        .from('barbers')
        .select(`
          *,
          profiles (
            id,
            name,
            phone,
            email
          )
        `)
        .eq('is_active', true);

      if (isUUID) {
        query = query.eq('id', barberId);
      } else {
        query = query.eq('profiles.name', barberId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('[BookingService] Error getting barber data:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('[BookingService] Unexpected error getting barber data:', error);
      return { data: null, error: 'Erro inesperado ao obter dados do barbeiro' };
    }
  }

  /**
   * Obtém serviços de um barbeiro
   */
  static async getBarberServices(barberId: string): Promise<ServiceResponse<Service[]>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('barber_id', barberId)
        .order('name');

      if (error) {
        console.error('[BookingService] Error getting services:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('[BookingService] Unexpected error getting services:', error);
      return { data: null, error: 'Erro inesperado ao obter serviços' };
    }
  }

  /**
   * Obtém horários de trabalho de um barbeiro
   */
  static async getWorkingHours(barberId: string): Promise<ServiceResponse<WorkingHour[]>> {
    try {
      const { data, error } = await supabase
        .from('working_hours')
        .select('*')
        .eq('barber_id', barberId)
        .order('day_of_week');

      if (error) {
        console.error('[BookingService] Error getting working hours:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('[BookingService] Unexpected error getting working hours:', error);
      return { data: null, error: 'Erro inesperado ao obter horários de trabalho' };
    }
  }

  /**
   * Obtém agendamentos de um barbeiro para uma data específica
   */
  static async getAppointments(barberId: string, date: string): Promise<ServiceResponse<Appointment[]>> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .eq('appointment_date', date)
        .neq('status', 'cancelled');

      if (error) {
        console.error('[BookingService] Error getting appointments:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('[BookingService] Unexpected error getting appointments:', error);
      return { data: null, error: 'Erro inesperado ao obter agendamentos' };
    }
  }

  /**
   * Cria um novo agendamento
   */
  static async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<ServiceResponse<Appointment>> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();

      if (error) {
        console.error('[BookingService] Error creating appointment:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('[BookingService] Unexpected error creating appointment:', error);
      return { data: null, error: 'Erro inesperado ao criar agendamento' };
    }
  }

  /**
   * Atualiza um agendamento existente
   */
  static async updateAppointment(id: string, updates: Partial<Appointment>): Promise<ServiceResponse<Appointment>> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[BookingService] Error updating appointment:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('[BookingService] Unexpected error updating appointment:', error);
      return { data: null, error: 'Erro inesperado ao atualizar agendamento' };
    }
  }

  /**
   * Cancela um agendamento
   */
  static async cancelAppointment(id: string): Promise<ServiceResponse<Appointment>> {
    return this.updateAppointment(id, { status: 'cancelled' });
  }

  /**
   * Obtém todos os barbeiros ativos
   */
  static async getAllBarbers(): Promise<ServiceResponse<Barber[]>> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profiles (
            id,
            name,
            phone,
            email
          )
        `)
        .eq('is_active', true)
        .order('profiles.name');

      if (error) {
        console.error('[BookingService] Error getting all barbers:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('[BookingService] Unexpected error getting all barbers:', error);
      return { data: null, error: 'Erro inesperado ao obter barbeiros' };
    }
  }

  /**
   * Obtém estatísticas de agendamentos para um barbeiro
   */
  static async getAppointmentStats(barberId: string, startDate: string, endDate: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .neq('status', 'cancelled');

      if (error) {
        console.error('[BookingService] Error getting appointment stats:', error);
        return { data: null, error: error.message };
      }

      // Processa as estatísticas
      const stats = {
        total: data?.length || 0,
        byStatus: data?.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        byDate: data?.reduce((acc, apt) => {
          acc[apt.appointment_date] = (acc[apt.appointment_date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('[BookingService] Unexpected error getting appointment stats:', error);
      return { data: null, error: 'Erro inesperado ao obter estatísticas' };
    }
  }

  /**
   * Gera o link de agendamento para um barbeiro
   */
  static getBookingLink(barberId: string): string {
    if (!barberId) {
      console.error('[BookingService] Barber ID is required to generate booking link');
      return '';
    }

    // Gera um link absoluto para a página de agendamento com o ID do barbeiro
    // Use the '/agendar/:barberId' route to match the app routing and Share dialog.
    const baseUrl = window.location.origin;
    return `${baseUrl}/agendar/${barberId}`;
  }

  /**
   * Obtém barbeiro por ID do link
   */
  static async getBarberByLinkId(linkId: string): Promise<ServiceResponse<Barber>> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profiles (
            id,
            name,
            phone,
            email
          )
        `)
        .eq('id', linkId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('[BookingService] Error getting barber by link:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('[BookingService] Unexpected error getting barber by link:', error);
      return { data: null, error: 'Erro inesperado ao obter barbeiro pelo link' };
    }
  }
}
