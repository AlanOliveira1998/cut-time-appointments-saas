import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Appointment } from '@/types';

const statusVariantMap = {
  scheduled: 'default',
  confirmed: 'success',
  completed: 'outline',
  canceled: 'destructive',
  pending: 'warning'
} as const;

const statusIconMap = {
  scheduled: <Clock className="h-4 w-4 mr-2" />,
  confirmed: <CheckCircle className="h-4 w-4 mr-2" />,
  completed: <CheckCircle className="h-4 w-4 mr-2" />,
  canceled: <XCircle className="h-4 w-4 mr-2" />,
  pending: <Clock className="h-4 w-4 mr-2" />
};

interface DashboardAppointmentsProps {
  appointments: Appointment[];
  loading: boolean;
  onViewAppointment: (id: string) => void;
}

export const DashboardAppointments = ({
  appointments,
  loading,
  onViewAppointment
}: DashboardAppointmentsProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Próximos Agendamentos</CardTitle>
        <Button variant="outline" size="sm">
          Ver todos
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {appointment.client_name}
                  </TableCell>
                  <TableCell>{appointment.service_name}</TableCell>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[appointment.status] as any} className="capitalize">
                      {statusIconMap[appointment.status]}
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewAppointment(appointment.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
