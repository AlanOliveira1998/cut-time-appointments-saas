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
    console.log('selectedBarber changed:', selectedBarber);
  }, [selectedBarber]);

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

  useEffect(() => {
    if (selectedService && selectedDate && selectedBarber) {
      const slots = calculateAvailableSlots(selectedService, selectedDate, workingHours, appointments, services);
      setAvailableSlots(slots);
    }
  }, [selectedService, selectedDate, appointments, workingHours, selectedBarber, services]);

  const handleBarberSelect = (barber: Barber) => {
    console.log('Barbeiro selecionado:', barber);
    setSelectedBarber(barber);
    setSelectedService(null); // Resetar serviço selecionado
    setSelectedDate(''); // Resetar data selecionada
    setSelectedTime(''); // Resetar horário selecionado
    setCurrentStep(2);
  };

  const handleServiceSelect = (service: Service) => {
    console.log('Serviço selecionado:', service);
    console.log('Barbeiro atual:', selectedBarber);
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

  if (loadingBarbers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
            <Scissors className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg">Carregando barbeiros...</p>
        </div>
      </div>
    );
  }

  if (isBookingComplete && selectedService && selectedBarber) {
    return (
      <BookingConfirmation
        barber={{ 
          id: selectedBarber.id, 
          name: selectedBarber.profiles?.name || selectedBarber.employee_name || 'Nome não informado',
          phone: selectedBarber.profiles?.phone || selectedBarber.employee_phone || '', 
          created_at: '' 
        }}
        selectedBarber={selectedBarber}
        selectedService={selectedService}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
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
          <h1 className="text-3xl font-bold mb-2">Agendar Serviço</h1>
          <p className="text-gray-600">
            {selectedBarber 
              ? `Agendando com ${selectedBarber.profiles?.name || selectedBarber.employee_name}` 
              : 'Escolha o barbeiro e serviço de sua preferência'
            }
          </p>
        </div>

        <ProgressSteps currentStep={currentStep} />

        {/* Step 1: Selecionar Barbeiro */}
        {currentStep === 1 && (
          <BarberSelection
            barbers={filteredBarbers}
            onBarberSelect={handleBarberSelect}
          />
        )}

        {/* Step 2: Selecionar Serviço */}
        {currentStep === 2 && selectedBarber && (
          <ServiceSelection
            services={services}
            selectedBarber={selectedBarber}
            onServiceSelect={handleServiceSelect}
          />
        )}

        {/* Step 3: Selecionar Data e Hora */}
        {currentStep === 3 && selectedService && selectedBarber && (
          <DateTimeSelection
            selectedService={selectedService}
            selectedBarber={selectedBarber}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableSlots={availableSlots}
            onDateChange={(date) => {
              setSelectedDate(date);
              setSelectedTime(''); // Limpar horário selecionado
            }}
            onTimeChange={setSelectedTime}
            onBack={() => setCurrentStep(2)}
            onContinue={handleDateTimeSelect}
          />
        )}

        {/* Fallback para quando selectedBarber está undefined */}
        {currentStep === 3 && selectedService && !selectedBarber && (
          <Card className="barber-card">
            <CardContent className="p-6">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Erro: Barbeiro não encontrado</p>
                <p className="text-sm text-gray-400 mt-2">Por favor, volte e selecione um barbeiro novamente</p>
                <Button 
                  onClick={() => setCurrentStep(1)} 
                  className="mt-4 barber-button-primary"
                >
                  Voltar para Seleção de Barbeiro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Dados do Cliente */}
        {currentStep === 4 && selectedService && selectedBarber && (
          <ClientDataForm
            selectedBarber={selectedBarber}
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            clientName={clientName}
            clientPhone={clientPhone}
            onClientNameChange={setClientName}
            onClientPhoneChange={setClientPhone}
            onBack={() => setCurrentStep(3)}
            onSubmit={handleBooking}
          />
        )}
      </div>
    </div>
  );
};