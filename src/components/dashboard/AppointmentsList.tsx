
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  barber_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
  services?: {
    name: string;
    duration: number;
    price: number;
  };
  barbers?: {
    employee_name?: string;
    profiles?: {
      name: string;
    } | null;
  };
}

interface Barber {
  id: string;
  employee_name?: string;
  profiles?: {
    name: string;
  } | null;
}

export const AppointmentsList: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserRole();
      loadBarbers();
      loadAppointments();
    }
  }, [user, selectedDate, selectedBarber]);

  const checkUserRole = async () => {
    if (!user) return;

    try {
      const { data: barberData, error } = await supabase
        .from('barbers')
        .select('role')
        .eq('profile_id', user.id)
        .single();

      if (!error && barberData) {
        setIsOwner(barberData.role === 'owner');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const loadBarbers = async () => {
    if (!user) return;

    try {
      // Se for dono, carregar todos os barbeiros da barbearia
      // Se for funcionário, carregar apenas ele mesmo
      let query = supabase
        .from('barbers')
        .select(`
          id,
          employee_name,
          profiles (
            name
          )
        `)
        .eq('is_active', true);

      if (!isOwner) {
        // Se não for dono, carregar apenas o próprio barbeiro
        const { data: currentBarber } = await supabase
          .from('barbers')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (currentBarber) {
          query = query.eq('id', currentBarber.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading barbers:', error);
        return;
      }

      setBarbers(data || []);
    } catch (error) {
      console.error('Error loading barbers:', error);
    }
  };

  const loadAppointments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Construir query base
      let query = supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            duration,
            price
          ),
          barbers (
            employee_name,
            profiles (
              name
            )
          )
        `)
        .eq('appointment_date', selectedDate)
        .order('appointment_time');

      // Se não for dono, filtrar apenas agendamentos do próprio barbeiro
      if (!isOwner) {
        const { data: currentBarber } = await supabase
          .from('barbers')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (currentBarber) {
          query = query.eq('barber_id', currentBarber.id);
        }
      } else if (selectedBarber !== 'all') {
        // Se for dono e selecionou um barbeiro específico
        query = query.eq('barber_id', selectedBarber);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading appointments:', error);
        toast({
          title: "Erro ao carregar agendamentos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment:', error);
        toast({
          title: "Erro ao atualizar agendamento",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      loadAppointments();
      
      const statusText = status === 'completed' ? 'concluído' : 'cancelado';
      toast({
        title: `Agendamento ${statusText}!`,
        description: `O agendamento foi marcado como ${statusText}.`,
      });
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Erro ao atualizar agendamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds if present
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getBarberName = (appointment: Appointment) => {
    if (appointment.barbers?.profiles?.name) {
      return appointment.barbers.profiles.name;
    }
    if (appointment.barbers?.employee_name) {
      return appointment.barbers.employee_name;
    }
    return 'Barbeiro não informado';
  };

  if (loading) {
    return (
      <Card className="barber-card">
        <CardContent className="p-6">
          <div className="text-center">Carregando agendamentos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="barber-card">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[#00657C]" />
            <div>
              <CardTitle className="text-xl">
                {isOwner ? 'Agenda da Barbearia' : 'Minha Agenda'}
              </CardTitle>
              <CardDescription>
                Visualize e gerencie os agendamentos
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Filtro por barbeiro (apenas para donos) */}
            {isOwner && barbers.length > 1 && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos os barbeiros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os barbeiros</SelectItem>
                    {barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.profiles?.name || barber.employee_name || 'Barbeiro'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <label htmlFor="date-select" className="text-sm font-medium">
                Data:
              </label>
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="font-medium text-lg mb-2">
            {formatDate(selectedDate)}
          </h3>
          {isOwner && selectedBarber !== 'all' && (
            <p className="text-sm text-gray-600">
              Filtrado por: {barbers.find(b => b.id === selectedBarber)?.profiles?.name || barbers.find(b => b.id === selectedBarber)?.employee_name}
            </p>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">Nenhum agendamento para este dia</p>
            <p className="text-sm text-gray-400">
              Os agendamentos feitos pelos clientes aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-[#00657C] text-white rounded-full flex items-center justify-center font-semibold">
                      {appointment.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{appointment.client_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.client_phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(appointment.appointment_time)}</span>
                        </div>
                        {isOwner && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{getBarberName(appointment)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
                
                {appointment.services && (
                  <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{appointment.services.name}</span>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>{appointment.services.duration} minutos</span>
                          <span>{formatPrice(appointment.services.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {appointment.status === 'scheduled' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
