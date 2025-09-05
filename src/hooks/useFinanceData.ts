import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FinanceAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  status: string;
  barbers?: {
    id: string;
    employee_name?: string;
    profiles?: {
      name: string;
    };
  };
  services?: {
    name: string;
    price: number;
  };
}

interface FinanceStats {
  totalRevenue: number;
  completedAppointments: number;
  pendingRevenue: number;
  cancelledAppointments: number;
}

export const useFinanceData = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<FinanceAppointment[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<'all' | string>('all');
  const [status, setStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadFinanceData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get barber IDs for the current user's barbershop
      const { data: barbers, error: barbersError } = await supabase
        .from('barbers')
        .select('id')
        .or(`profile_id.eq.${user.id},barbershop_id.in.(select id from barbershops where owner_id.eq.${user.id})`);

      if (barbersError) throw barbersError;

      const barberIds = barbers?.map(b => b.id) || [];
      
      if (barberIds.length === 0) {
        setAppointments([]);
        setStats({
          totalRevenue: 0,
          completedAppointments: 0,
          pendingRevenue: 0,
          cancelledAppointments: 0
        });
        return;
      }

      // Build query with filters
      let query = supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          client_name,
          status,
          barbers!inner(
            id,
            employee_name,
            profiles(name)
          ),
          services!inner(
            name,
            price
          )
        `)
        .in('barber_id', barberIds)
        .order('appointment_date', { ascending: false });

      // Apply filters
      if (selectedBarber !== 'all') {
        query = query.eq('barber_id', selectedBarber);
      }

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (startDate) {
        query = query.gte('appointment_date', startDate);
      }

      if (endDate) {
        query = query.lte('appointment_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAppointments(data || []);

      // Calculate stats
      const totalRevenue = data?.reduce((sum, appointment) => {
        if (appointment.status === 'completed') {
          return sum + (appointment.services?.price || 0);
        }
        return sum;
      }, 0) || 0;

      const completedAppointments = data?.filter(a => a.status === 'completed').length || 0;
      
      const pendingRevenue = data?.reduce((sum, appointment) => {
        if (appointment.status === 'scheduled') {
          return sum + (appointment.services?.price || 0);
        }
        return sum;
      }, 0) || 0;

      const cancelledAppointments = data?.filter(a => a.status === 'cancelled').length || 0;

      setStats({
        totalRevenue,
        completedAppointments,
        pendingRevenue,
        cancelledAppointments
      });

    } catch (err: any) {
      console.error('Error loading finance data:', err);
      toast({
        title: "Erro ao carregar dados financeiros",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, selectedBarber, status, startDate, endDate]);

  const exportToCSV = useCallback(() => {
    if (!appointments.length) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há agendamentos para exportar.",
        variant: "destructive",
      });
      return;
    }

    const header = ['Barbeiro', 'Serviço', 'Cliente', 'Data', 'Horário', 'Valor', 'Status'];
    const rows = appointments.map(a => [
      a.barbers?.profiles?.name || a.barbers?.employee_name || 'Dono',
      a.services?.name || '-',
      a.client_name,
      a.appointment_date,
      a.appointment_time,
      a.services?.price ? (a.services.price || 0).toFixed(2) : '-',
      a.status
    ]);

    const csv = [header, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório exportado!",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  }, [appointments]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  return {
    appointments,
    stats,
    loading,
    selectedBarber,
    setSelectedBarber,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    exportToCSV,
    refreshData: loadFinanceData
  };
};
