
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment, Service } from '../../types';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AppointmentsList: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [user, selectedDate]);

  const loadData = () => {
    if (!user) return;
    
    // Carregar agendamentos
    const allAppointments = JSON.parse(localStorage.getItem('barbertime_appointments') || '[]');
    const userAppointments = allAppointments.filter((apt: Appointment) => 
      apt.barberId === user.id && apt.date === selectedDate
    );
    
    // Carregar serviços
    const allServices = JSON.parse(localStorage.getItem('barbertime_services') || '[]');
    const userServices = allServices.filter((service: Service) => service.barberId === user.id);
    
    // Combinar dados
    const appointmentsWithServices = userAppointments.map((apt: Appointment) => ({
      ...apt,
      service: userServices.find((s: Service) => s.id === apt.serviceId)
    }));
    
    // Ordenar por horário
    appointmentsWithServices.sort((a, b) => a.time.localeCompare(b.time));
    
    setAppointments(appointmentsWithServices);
    setServices(userServices);
  };

  const updateAppointmentStatus = (appointmentId: string, status: 'completed' | 'cancelled') => {
    const allAppointments = JSON.parse(localStorage.getItem('barbertime_appointments') || '[]');
    const updatedAppointments = allAppointments.map((apt: Appointment) => 
      apt.id === appointmentId ? { ...apt, status } : apt
    );
    
    localStorage.setItem('barbertime_appointments', JSON.stringify(updatedAppointments));
    loadData();
    
    const statusText = status === 'completed' ? 'concluído' : 'cancelado';
    toast({
      title: `Agendamento ${statusText}!`,
      description: `O agendamento foi marcado como ${statusText}.`,
    });
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
    return timeString;
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

  return (
    <Card className="barber-card">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[#00657C]" />
            <div>
              <CardTitle className="text-xl">Agenda do Dia</CardTitle>
              <CardDescription>
                Visualize e gerencie seus agendamentos
              </CardDescription>
            </div>
          </div>
          
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
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="font-medium text-lg mb-2">
            {formatDate(selectedDate)}
          </h3>
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
                      {appointment.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{appointment.clientName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.clientPhone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(appointment.time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
                
                {appointment.service && (
                  <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{appointment.service.name}</span>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>{appointment.service.duration} minutos</span>
                          <span>{formatPrice(appointment.service.price)}</span>
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
