import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Scissors } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useBarbers } from '../components/booking/hooks/useBarbers';
import { useBookingData, Service } from '../components/booking/hooks/useBookingData';
import { calculateAvailableSlots } from '../components/booking/utils/bookingUtils';
import { BarberSelection } from '../components/booking/components/BarberSelection';
import { ServiceSelection } from '../components/booking/components/ServiceSelection';
import { DateTimeSelection } from '../components/booking/components/DateTimeSelection';
import { ClientDataForm } from '../components/booking/components/ClientDataForm';
import { BookingConfirmation } from '../components/booking/components/BookingConfirmation';
import { ProgressSteps } from '../components/booking/components/ProgressSteps';

interface Barber {
  id: string;
  profile_id: string;
  specialty?: string;
  experience_years: number;
  is_active: boolean;
  profiles: {
    name: string;
    phone?: string;
  };
}

export const Booking: React.FC = () => {
  const { barbers, loading: loadingBarbers } = useBarbers();
  
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isBookingComplete, setIsBookingComplete] = useState(false);

  // Carregar dados do barbeiro selecionado
  const { services, workingHours, appointments, loading: loadingBarberData, loadAppointments } = useBookingData(
    selectedBarber ? selectedBarber.profiles.name.toLowerCase().replace(/\s+/g, '-') : undefined
  );

  React.useEffect(() => {
    if (selectedService && selectedDate && selectedBarber) {
      const slots = calculateAvailableSlots(selectedService, selectedDate, workingHours, appointments, services);
      setAvailableSlots(slots);
    }
  }, [selectedService, selectedDate, appointments, workingHours, selectedBarber, services]);

  const handleBarberSelect = (barber: Barber) => {
    setSelectedBarber(barber);
    setCurrentStep(2);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(3);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime && selectedBarber) {
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
      console.log('Criando agendamento:', {
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        client_name: clientName,
        client_phone: clientPhone,
        appointment_date: selectedDate,
        appointment_time: selectedTime
      });

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
        barber={{ id: selectedBarber.id, name: selectedBarber.profiles.name, phone: selectedBarber.profiles.phone || '', created_at: '' }}
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
              ? `Agendando com ${selectedBarber.profiles.name}` 
              : 'Escolha o barbeiro e serviço de sua preferência'
            }
          </p>
        </div>

        <ProgressSteps currentStep={currentStep} />

        {/* Step 1: Selecionar Barbeiro */}
        {currentStep === 1 && (
          <BarberSelection
            barbers={barbers}
            onBarberSelect={handleBarberSelect}
          />
        )}

        {/* Step 2: Selecionar Serviço */}
        {currentStep === 2 && selectedBarber && (
          <ServiceSelection
            services={services}
            onServiceSelect={handleServiceSelect}
          />
        )}

        {/* Step 3: Selecionar Data e Hora */}
        {currentStep === 3 && selectedService && selectedBarber && (
          <DateTimeSelection
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableSlots={availableSlots}
            onDateChange={(date) => {
              setSelectedDate(date);
              setSelectedTime('');
            }}
            onTimeChange={setSelectedTime}
            onBack={() => setCurrentStep(2)}
            onContinue={handleDateTimeSelect}
          />
        )}

        {/* Step 4: Dados do Cliente */}
        {currentStep === 4 && selectedService && selectedBarber && (
          <ClientDataForm
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