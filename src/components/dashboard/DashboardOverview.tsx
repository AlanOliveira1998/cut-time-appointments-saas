import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from './StatCard';

interface DashboardOverviewProps {
  stats: {
    totalAppointments: number;
    totalRevenue: number;
    totalClients: number;
    averageRating: number;
  };
  loading: boolean;
}

export const DashboardOverview = ({ stats, loading }: DashboardOverviewProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Agendamentos"
        value={stats.totalAppointments || 0}
        description="Agendamentos realizados"
        loading={loading}
      />
      <StatCard
        title="Receita Total"
        value={`R$ ${stats.totalRevenue?.toFixed(2) || '0.00'}`}
        description="Receita total gerada"
        loading={loading}
      />
      <StatCard
        title="Total de Clientes"
        value={stats.totalClients || 0}
        description="Clientes únicos"
        loading={loading}
      />
      <StatCard
        title="Avaliação Média"
        value={stats.averageRating?.toFixed(1) || '0.0'}
        description="Avaliação dos clientes"
        loading={loading}
      />
    </div>
  );
};
