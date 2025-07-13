import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Scissors } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useBookingData, Service, Profile } from './hooks/useBookingData';
import { useBarbers } from './hooks/useBarbers';
import { calculateAvailableSlots } from './utils/bookingUtils';
import { BarberSelection } from './components/BarberSelection';
import { ServiceSelection } from './components/ServiceSelection';
import { DateTimeSelection } from './components/DateTimeSelection';
import { ClientDataForm } from './components/ClientDataForm';
import { BookingConfirmation } from './components/BookingConfirmation';
import { ProgressSteps } from './components/ProgressSteps';
import type { Tables } from '@/integrations/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Barber {
  id: string;
  profile_id: string | null;
  specialty?: string;
  experience_years: number;
  is_active: boolean;
  role: 'owner' | 'employee';
  employee_name?: string;
  employee_phone?: string;
  profiles?: {
    name: string;
    phone?: string;
  } | null;
  working_hours?: Tables<'working_hours'>[];
}

export const BookingPage: React.FC = () => {
  const { barberName } = useParams<{ barberName: string }>();
  const { filteredBarbers, loading: loadingBarbers } = useBarbers();
  
  // Estado para barbeiro selecionado
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isBookingComplete, setIsBookingComplete] = useState(false);

  // Debug: Log selectedBarber changes
  useEffect(() => {
    console.log('=== DEBUG BOOKING PAGE ===');
    console.log('selectedBarber:', selectedBarber);
    console.log('Current step:', currentStep);
    console.log('Selected service:', selectedService);
    console.log('filteredBarbers length:', filteredBarbers.length);
    console.log('========================');
  }, [selectedBarber, currentStep, selectedService, filteredBarbers]);

  // Carregar dados do barbeiro selecionado
  const { services, workingHours, appointments, loading: loadingBarberData, loadAppointments, setAppointments } = useBookingData(
    selectedBarber?.id
  );

  // Se um barbeiro específico foi passado na URL, selecioná-lo automaticamente
  useEffect(() => {
    if (barberName && filteredBarbers.length > 0 && !selectedBarber) {
      const barberFromUrl = filteredBarbers.find(barber => {
        const barberDisplayName = barber.profiles?.name || barber.employee_name || '';
        return barberDisplayName.toLowerCase().includes(barberName.toLowerCase()) ||
               barber.id === barberName;
      });
      
      if (barberFromUrl) {
        console.log('Barbeiro encontrado na URL:', barberFromUrl);
        setSelectedBarber(barberFromUrl);
        setCurrentStep(2); // Pular para seleção de serviço
      } else {
        // Se o barbeiro não foi encontrado, mostrar mensagem e permitir seleção manual
        toast({
          title: "Barbeiro não encontrado",
          description: "O barbeiro solicitado não foi encontrado. Por favor, selecione um barbeiro disponível.",
          variant: "destructive",
        });
        setCurrentStep(1); // Voltar para seleção de barbeiro
      }
    } else if (!barberName && !selectedBarber) {
      // Se não há barbeiro na URL, sempre começar na seleção de barbeiros
      setCurrentStep(1);
    }
  }, [barberName, filteredBarbers, selectedBarber]);

  // Sempre que a lista de barbeiros mudar e não houver barbeiro selecionado, selecione o primeiro
  useEffect(() => {
    if (filteredBarbers.length > 0 && !selectedBarber) {
      console.log('Selecionando primeiro barbeiro automaticamente:', filteredBarbers[0]);
      setSelectedBarber(filteredBarbers[0]);
    }
  }, [filteredBarbers, selectedBarber]);

  // Se chegar na etapa 3 sem barbeiro, volte para etapa 1
  useEffect(() => {
    if (currentStep === 3 && !selectedBarber) {
      console.log('Etapa 3 sem barbeiro selecionado, voltando para etapa 1');
      setCurrentStep(1);
    }
  }, [currentStep, selectedBarber]);

  // Garantir que não avance para etapa 3 sem barbeiro
  useEffect(() => {
    if (currentStep === 3 && !selectedBarber) {
      console.log('Bloqueando avanço para etapa 3 sem barbeiro');
      setCurrentStep(1);
    }
  }, [currentStep, selectedBarber]);

  useEffect(() => {
    if (selectedService && selectedDate && selectedBarber) {
      const slots = calculateAvailableSlots(selectedService, selectedDate, workingHours, appointments, services);
      setAvailableSlots(slots);
    }
  }, [selectedService, selectedDate, appointments, workingHours, selectedBarber, services]);

  const handleBarberSelect = (barber: Barber) => {
    console.log('Barbeiro selecionado manualmente:', barber);
    setSelectedBarber(barber);
    setSelectedService(null); // Resetar serviço selecionado
    setSelectedDate(''); // Resetar data selecionada
    setSelectedTime(''); // Resetar horário selecionado
    setCurrentStep(2);
  };

  const handleServiceSelect = (service: Service) => {
    if (!selectedBarber) {
      console.log('Tentativa de selecionar serviço sem barbeiro, voltando para etapa 1');
      setCurrentStep(1);
      return;
    }
    console.log('Serviço selecionado:', service);
    setSelectedService(service);
    setCurrentStep(3);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime && selectedBarber) {
      // Recarregar agendamentos para a data selecionada
      loadAppointments(selectedBarber.id, selectedDate);
      setCurrentStep(4);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone || !selectedBarber) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Debug: Verificar o que está sendo usado
      console.log('=== DEBUG AGENDAMENTO ===');
      console.log('Selected Barber:', selectedBarber);
      console.log('Barber ID:', selectedBarber.id);
      console.log('Selected Service:', selectedService);
      console.log('Selected Date:', selectedDate);
      console.log('Selected Time:', selectedTime);
      console.log('Client Name:', clientName);
      console.log('Client Phone:', clientPhone);
      console.log('========================');
      
      console.log('Criando agendamento:', {
        barber_id: selectedBarber.id,
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
          barber_id: selectedBarber.id,
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
      setCurrentStep(5);
      
      toast({
        title: "Agendamento realizado com sucesso!",
        description: "Seu horário foi confirmado. Aguardamos você!",
      });

      // Atualizar a lista de agendamentos
      if (selectedBarber && selectedDate) {
        loadAppointments(selectedBarber.id, selectedDate);
      }

    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro ao criar agendamento",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setSelectedBarber(null);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
    setCurrentStep(1);
    setIsBookingComplete(false);
  };

  if (loadingBarbers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
        <Card className="barber-card w-full max-w-md animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-xl flex items-center justify-center animate-pulse">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600">Carregando barbeiros...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="barber-header py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo e Nome removidos */}
          <div></div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center space-x-1"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="barber-container py-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <ProgressSteps currentStep={currentStep} />
          </div>

          {/* Card Principal */}
          <Card className="barber-card animate-fade-in-up">
            <CardContent className="p-6 sm:p-8">
              {currentStep === 1 && (
                <BarberSelection
                  barbers={filteredBarbers}
                  onBarberSelect={handleBarberSelect}
                />
              )}

              {currentStep === 2 && (
                <ServiceSelection
                  services={services}
                  selectedBarber={selectedBarber}
                  onServiceSelect={handleServiceSelect}
                />
              )}

              {currentStep === 3 && (
                <DateTimeSelection
                  selectedService={selectedService}
                  selectedBarber={selectedBarber}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  availableSlots={availableSlots}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                  onBack={handleBack}
                  onContinue={handleDateTimeSelect}
                />
              )}

              {currentStep === 4 && (
                <ClientDataForm
                  clientName={clientName}
                  clientPhone={clientPhone}
                  onClientNameChange={setClientName}
                  onClientPhoneChange={setClientPhone}
                  onBack={handleBack}
                  onSubmit={handleBooking}
                  selectedBarber={selectedBarber}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                />
              )}

              {currentStep === 5 && (
                <BookingConfirmation
                  barber={{
                    id: selectedBarber?.id || '',
                    name: selectedBarber?.profiles?.name || selectedBarber?.employee_name || '',
                    phone: selectedBarber?.profiles?.phone || selectedBarber?.employee_phone || '',
                    created_at: ''
                  }}
                  selectedBarber={selectedBarber}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};