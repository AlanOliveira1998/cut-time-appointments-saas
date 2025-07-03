import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, User as UserIcon, Phone, Scissors, CheckCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface Service {
  id: string;
  barber_id: string;
  name: string;
  duration: number;
  price: number;
  created_at: string;
}

interface WorkingHour {
  id: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

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
}

interface Profile {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

export const BookingPage: React.FC = () => {
  const { barberName } = useParams<{ barberName: string }>();
  const [barber, setBarber] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBarberData();
  }, [barberName]);

  useEffect(() => {
    if (selectedService && selectedDate && barber) {
      calculateAvailableSlots();
    }
  }, [selectedService, selectedDate, appointments, workingHours, barber]);

  const loadBarberData = async () => {
    if (!barberName) return;
    
    try {
      setLoading(true);
      console.log('Carregando dados do barbeiro:', barberName);
      
      // Buscar barbeiro pelo nome (URL amigável)
      // Convertendo o nome da URL de volta para busca
      const searchName = barberName.replace(/-/g, ' ');
      console.log('Nome de busca:', searchName);
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${searchName}%`);

      console.log('Resultado da busca de profiles:', profiles, profileError);

      if (profileError) {
        console.error('Error loading barber:', profileError);
        toast({
          title: "Erro ao carregar barbeiro",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('Nenhum barbeiro encontrado');
        toast({
          title: "Barbeiro não encontrado",
          description: "O barbeiro solicitado não foi encontrado.",
          variant: "destructive",
        });
        return;
      }

      const foundBarber = profiles[0];
      console.log('Barbeiro encontrado:', foundBarber);
      setBarber(foundBarber);
      
      // Carregar serviços do barbeiro
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('barber_id', foundBarber.id);

      console.log('Serviços carregados:', servicesData, servicesError);

      if (servicesError) {
        console.error('Error loading services:', servicesError);
      } else {
        setServices(servicesData || []);
      }
      
      // Carregar horários de funcionamento
      const { data: workingHoursData, error: workingHoursError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('barber_id', foundBarber.id);

      console.log('Horários carregados:', workingHoursData, workingHoursError);

      if (workingHoursError) {
        console.error('Error loading working hours:', workingHoursError);
      } else {
        setWorkingHours(workingHoursData || []);
      }
      
    } catch (error) {
      console.error('Error loading barber data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar os dados do barbeiro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async (barberId: string) => {
    if (!selectedDate) return;

    try {
      console.log('Carregando agendamentos para:', barberId, selectedDate);
      
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .eq('appointment_date', selectedDate)
        .neq('status', 'cancelled');

      console.log('Agendamentos carregados:', appointmentsData, error);

      if (error) {
        console.error('Error loading appointments:', error);
      } else {
        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const calculateAvailableSlots = () => {
    if (!selectedService || !selectedDate || !workingHours.length || !barber) return;
    
    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay();
    
    // Encontrar horário de funcionamento para o dia
    const dayWorkingHour = workingHours.find(wh => wh.day_of_week === dayOfWeek && wh.is_active);
    
    if (!dayWorkingHour) {
      setAvailableSlots([]);
      return;
    }
    
    // Gerar slots de 30 minutos
    const slots: string[] = [];
    const [startHour, startMinute] = dayWorkingHour.start_time.split(':').map(Number);
    const [endHour, endMinute] = dayWorkingHour.end_time.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    for (let time = startTime; time < endTime; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Verificar se o slot não conflita com agendamentos existentes
      const hasConflict = appointments.some(apt => {
        const aptStartTime = apt.appointment_time;
        const aptService = services.find(s => s.id === apt.service_id);
        if (!aptService) return false;
        
        const [aptHour, aptMinute] = aptStartTime.split(':').map(Number);
        const aptStart = aptHour * 60 + aptMinute;
        const aptEnd = aptStart + aptService.duration;
        
        const slotEnd = time + selectedService.duration;
        
        return !(slotEnd <= aptStart || time >= aptEnd);
      });
      
      if (!hasConflict && time + selectedService.duration <= endTime) {
        slots.push(timeString);
      }
    }
    
    setAvailableSlots(slots);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      // Recarregar agendamentos para a data selecionada
      if (barber) {
        loadAppointments(barber.id);
      }
      setCurrentStep(3);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone || !barber) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Criando agendamento:', {
        barber_id: barber.id,
        service_id: selectedService.id,
        client_name: clientName,
        client_phone: clientPhone,
        appointment_date: selectedDate,
        appointment_time: selectedTime
      });

      // Criar novo agendamento no Supabase
      const { error } = await supabase
        .from('appointments')
        .insert({
          barber_id: barber.id,
          service_id: selectedService.id,
          client_name: clientName,
          client_phone: clientPhone,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          status: 'scheduled'
        });

      if (error) {
        console.error('Error creating appointment:', error);
        toast({
          title: "Erro ao criar agendamento",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setIsBookingComplete(true);
      setCurrentStep(4);
      
      toast({
        title: "Agendamento confirmado!",
        description: "Seu horário foi agendado com sucesso.",
      });
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro ao criar agendamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular data mínima (hoje) e máxima (30 dias)
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
            <Scissors className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Scissors className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Barbeiro não encontrado</h1>
          <p className="text-gray-600">O barbeiro solicitado não foi encontrado.</p>
        </div>
      </div>
    );
  }

  if (isBookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="barber-card text-center">
            <CardContent className="pt-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h2>
              <p className="text-gray-600 mb-6">
                Seu horário foi reservado com sucesso.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-3">Detalhes do agendamento:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>Barbeiro: {barber.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-4 h-4 text-gray-400" />
                    <span>Serviço: {selectedService?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Data: {formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Horário: {selectedTime}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Em caso de dúvidas, entre em contato com {barber.name} pelo telefone {barber.phone}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#00657C] to-[#004A5A] rounded-full flex items-center justify-center">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Agendar com {barber.name}</h1>
          <p className="text-gray-600">Escolha o serviço e horário de sua preferência</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-[#00657C] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 ml-4 ${
                    currentStep > step ? 'bg-[#00657C]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Selecionar Serviço */}
        {currentStep === 1 && (
          <Card className="barber-card">
            <CardHeader>
              <CardTitle>Escolha o serviço</CardTitle>
              <CardDescription>
                Selecione o serviço que deseja agendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow hover:border-[#00657C]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{service.name}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{service.duration}min</span>
                            </Badge>
                            <Badge variant="outline" className="flex items-center space-x-1 font-semibold">
                              <span>{formatPrice(service.price)}</span>
                            </Badge>
                          </div>
                        </div>
                        <Button className="barber-button-primary">
                          Selecionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Selecionar Data e Hora */}
        {currentStep === 2 && selectedService && (
          <Card className="barber-card">
            <CardHeader>
              <CardTitle>Escolha data e horário</CardTitle>
              <CardDescription>
                Serviço selecionado: {selectedService.name} - {formatPrice(selectedService.price)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(''); // Limpar horário selecionado
                  }}
                  min={today}
                  max={maxDateString}
                  className="w-full"
                />
              </div>
              
              {selectedDate && (
                <div className="space-y-2">
                  <Label>Horários disponíveis</Label>
                  {availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Nenhum horário disponível para esta data.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? "default" : "outline"}
                          onClick={() => setSelectedTime(slot)}
                          className={selectedTime === slot ? "barber-button-primary" : ""}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleDateTimeSelect}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 barber-button-primary"
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Dados do Cliente */}
        {currentStep === 3 && (
          <Card className="barber-card">
            <CardHeader>
              <CardTitle>Seus dados</CardTitle>
              <CardDescription>
                Preencha seus dados para finalizar o agendamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nome completo</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clientName"
                      placeholder="Seu nome completo"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Resumo do agendamento</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Serviço: {selectedService.name}</div>
                    <div>Data: {formatDate(selectedDate)}</div>
                    <div>Horário: {selectedTime}</div>
                    <div>Duração: {selectedService.duration} minutos</div>
                    <div className="font-semibold text-[#00657C]">
                      Valor: {formatPrice(selectedService.price)}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 barber-button-primary"
                  >
                    Confirmar Agendamento
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
