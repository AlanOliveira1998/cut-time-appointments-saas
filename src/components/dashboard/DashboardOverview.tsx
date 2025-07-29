import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, DollarSign, Scissors, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading: boolean;
  description?: string;
}

const StatCard = ({ title, value, icon, loading, description }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

interface DashboardOverviewProps {
  stats: {
    totalAppointments: number;
    pendingAppointments: number;
    totalRevenue: number;
    averageServiceTime: string;
  };
  loading: boolean;
}

export const DashboardOverview = ({ stats, loading }: DashboardOverviewProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Agendamentos Hoje"
        value={stats.totalAppointments}
        icon={<Calendar className="h-4 w-4" />}
        loading={loading}
      />
      <StatCard
        title="Pendentes"
        value={stats.pendingAppointments}
        icon={<Users className="h-4 w-4" />}
        loading={loading}
      />
      <StatCard
        title="Receita Total"
        value={formatCurrency(stats.totalRevenue)}
        icon={<DollarSign className="h-4 w-4" />}
        loading={loading}
      />
      <StatCard
        title="Tempo Médio"
        value={stats.averageServiceTime}
        icon={<Clock className="h-4 w-4" />}
        loading={loading}
      />
    </div>
  );
};
