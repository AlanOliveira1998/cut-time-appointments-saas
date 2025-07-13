import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Scissors } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useBookingData, Service, Profile } from './hooks/useBookingData';
import { calculateAvailableSlots } from './utils/bookingUtils';
import { ServiceSelection } from './components/ServiceSelection';
import { DateTimeSelection } from './components/DateTimeSelection';
import { ClientDataForm } from './components/ClientDataForm';
import { BookingConfirmation } from './components/BookingConfirmation';
import { ProgressSteps } from './components/ProgressSteps';

export const BookingPage: React.FC = () => {
  const { barberName } = useParams<{ barberName: string }>();
  const { barber, services, workingHours, appointments, loading, loadAppointments, setAppointments } = useBookingData(barberName);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isBookingComplete, setIsBookingComplete] = useState(false);

  useEffect(() => {
    if (selectedService && selectedDate && barber) {
      const slots = calculateAvailableSlots(selectedService, selectedDate, workingHours, appointments, services);
      setAvailableSlots(slots);
    }
  }, [selectedService, selectedDate, appointments, workingHours, barber, services]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      // Recarregar agendamentos para a data selecionada
      if (barber) {
        loadAppointments(barber.id, selectedDate);
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
      // Debug: Verificar o que está sendo usado
      console.log('=== DEBUG AGENDAMENTO ===');
      console.log('Barber object:', barber);
      console.log('Barber ID:', barber.id);
      console.log('Selected Service:', selectedService);
      console.log('Selected Date:', selectedDate);
      console.log('Selected Time:', selectedTime);
      console.log('Client Name:', clientName);
      console.log('Client Phone:', clientPhone);
      console.log('========================');
      
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

  if (isBookingComplete && selectedService) {
    return (
      <BookingConfirmation
        barber={barber}
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
          <h1 className="text-3xl font-bold mb-2">Agendar com {barber.name}</h1>
          <p className="text-gray-600">Escolha o serviço e horário de sua preferência</p>
        </div>

        <ProgressSteps currentStep={currentStep} />

        {/* Step 1: Selecionar Serviço */}
        {currentStep === 1 && (
          <ServiceSelection
            services={services}
            onServiceSelect={handleServiceSelect}
          />
        )}

        {/* Step 2: Selecionar Data e Hora */}
        {currentStep === 2 && selectedService && (
          <DateTimeSelection
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableSlots={availableSlots}
            onDateChange={(date) => {
              setSelectedDate(date);
              setSelectedTime(''); // Limpar horário selecionado
            }}
            onTimeChange={setSelectedTime}
            onBack={() => setCurrentStep(1)}
            onContinue={handleDateTimeSelect}
          />
        )}

        {/* Step 3: Dados do Cliente */}
        {currentStep === 3 && selectedService && (
          <ClientDataForm
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            clientName={clientName}
            clientPhone={clientPhone}
            onClientNameChange={setClientName}
            onClientPhoneChange={setClientPhone}
            onBack={() => setCurrentStep(2)}
            onSubmit={handleBooking}
          />
        )}
      </div>
    </div>
  );
};