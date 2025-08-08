import { useState, useEffect } from 'react';
import { DashboardService, DashboardStats, AppointmentByDay, PopularTime, ServiceStats } from '@/services/dashboardService';

interface UseDashboardProps {
  barberId: string;
  startDate: string;
  endDate: string;
}

interface DashboardData {
  stats: DashboardStats | null;
  appointmentsByDay: AppointmentByDay[];
  popularTimes: PopularTime[];
  serviceStats: ServiceStats[];
  appointmentsTrend: { date: string; count: number; revenue: number }[];
}

interface UseDashboardReturn extends DashboardData {
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useDashboard = ({ barberId, startDate, endDate }: UseDashboardProps): UseDashboardReturn => {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    appointmentsByDay: [],
    popularTimes: [],
    serviceStats: [],
    appointmentsTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!barberId) return;

    setLoading(true);
    setError(null);

    try {
      const [
        stats,
        appointmentsByDay,
        popularTimes,
        serviceStats,
        appointmentsTrend
      ] = await Promise.all([
        DashboardService.getDashboardStats(barberId, startDate, endDate),
        DashboardService.getAppointmentsByDay(barberId, startDate, endDate),
        DashboardService.getPopularTimes(barberId, startDate, endDate),
        DashboardService.getServiceStats(barberId, startDate, endDate),
        DashboardService.getAppointmentsTrend(barberId, startDate, endDate)
      ]);

      setData({
        stats,
        appointmentsByDay,
        popularTimes,
        serviceStats,
        appointmentsTrend
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [barberId, startDate, endDate]);

  return {
    ...data,
    loading,
    error,
    refreshData
  };
};
