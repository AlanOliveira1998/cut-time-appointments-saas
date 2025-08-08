import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageRating: number;
}

export interface AppointmentByDay {
  day: string;
  count: number;
  revenue: number;
}

export interface PopularTime {
  hour: string;
  count: number;
}

export interface ServiceStats {
  serviceName: string;
  count: number;
  revenue: number;
}

export class DashboardService {
  /**
   * Busca estatísticas gerais do dashboard para um barbeiro
   */
  static async getDashboardStats(barberId: string, startDate: string, endDate: string): Promise<DashboardStats> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
      const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
      
      const totalRevenue = appointments?.reduce((sum, appointment) => {
        if (appointment.status === 'completed') {
          return sum + (appointment.price || 0);
        }
        return sum;
      }, 0) || 0;

      const averageRating = appointments?.filter(a => a.rating)?.reduce((sum, a) => sum + (a.rating || 0), 0) / 
        (appointments?.filter(a => a.rating)?.length || 1) || 0;

      return {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Busca agendamentos por dia da semana
   */
  static async getAppointmentsByDay(barberId: string, startDate: string, endDate: string): Promise<AppointmentByDay[]> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('status', 'completed');

      if (error) throw error;

      const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const dayStats = daysOfWeek.map(day => ({
        day,
        count: 0,
        revenue: 0
      }));

      appointments?.forEach(appointment => {
        const date = new Date(appointment.date);
        const dayIndex = date.getDay();
        const dayName = daysOfWeek[dayIndex];
        
        const dayStat = dayStats.find(stat => stat.day === dayName);
        if (dayStat) {
          dayStat.count++;
          dayStat.revenue += appointment.price || 0;
        }
      });

      return dayStats;
    } catch (error) {
      console.error('Error fetching appointments by day:', error);
      throw error;
    }
  }

  /**
   * Busca horários mais populares
   */
  static async getPopularTimes(barberId: string, startDate: string, endDate: string): Promise<PopularTime[]> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('status', 'completed');

      if (error) throw error;

      const timeStats: { [key: string]: number } = {};

      appointments?.forEach(appointment => {
        const hour = appointment.time?.split(':')[0] || '0';
        timeStats[hour] = (timeStats[hour] || 0) + 1;
      });

      return Object.entries(timeStats)
        .map(([hour, count]) => ({
          hour: `${hour}:00`,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching popular times:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas por serviço
   */
  static async getServiceStats(barberId: string, startDate: string, endDate: string): Promise<ServiceStats[]> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name
          )
        `)
        .eq('barber_id', barberId)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('status', 'completed');

      if (error) throw error;

      const serviceStats: { [key: string]: ServiceStats } = {};

      appointments?.forEach(appointment => {
        const serviceName = appointment.services?.name || 'Serviço não especificado';
        
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = {
            serviceName,
            count: 0,
            revenue: 0
          };
        }

        serviceStats[serviceName].count++;
        serviceStats[serviceName].revenue += appointment.price || 0;
      });

      return Object.values(serviceStats).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching service stats:', error);
      throw error;
    }
  }

  /**
   * Busca dados de agendamentos para gráfico de linha
   */
  static async getAppointmentsTrend(barberId: string, startDate: string, endDate: string): Promise<{ date: string; count: number; revenue: number }[]> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (error) throw error;

      const dateStats: { [key: string]: { count: number; revenue: number } } = {};

      appointments?.forEach(appointment => {
        const date = appointment.date;
        
        if (!dateStats[date]) {
          dateStats[date] = { count: 0, revenue: 0 };
        }

        dateStats[date].count++;
        if (appointment.status === 'completed') {
          dateStats[date].revenue += appointment.price || 0;
        }
      });

      return Object.entries(dateStats)
        .map(([date, stats]) => ({
          date,
          count: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error fetching appointments trend:', error);
      throw error;
    }
  }
}
