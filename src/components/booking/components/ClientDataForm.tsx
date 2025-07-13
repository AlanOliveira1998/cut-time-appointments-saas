import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Phone, User, Scissors } from 'lucide-react';
import { Service } from '../hooks/useBookingData';
import { formatPrice, formatDate } from '../utils/bookingUtils';

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
}

interface ClientDataFormProps {
  selectedBarber: Barber;
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
  clientName: string;
  clientPhone: string;
  onClientNameChange: (name: string) => void;
  onClientPhoneChange: (phone: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ClientDataForm: React.FC<ClientDataFormProps> = ({
  selectedBarber,
  selectedService,
  selectedDate,
  selectedTime,
  clientName,
  clientPhone,
  onClientNameChange,
  onClientPhoneChange,
  onBack,
  onSubmit
}) => {
  const getBarberName = (barber: Barber) => {
    return barber.profiles?.name || barber.employee_name || 'Nome não informado';
  };

  return (
    <Card className="barber-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserIcon className="w-5 h-5 text-[#00657C]" />
          <span>Seus dados</span>
        </CardTitle>
        <CardDescription>
          Preencha seus dados para finalizar o agendamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="clientName"
                  placeholder="Seu nome completo"
                  value={clientName}
                  onChange={(e) => onClientNameChange(e.target.value)}
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
                  onChange={(e) => onClientPhoneChange(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
              <Scissors className="w-5 h-5 text-[#00657C]" />
              <span>Resumo do agendamento</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    <strong>Barbeiro:</strong> {getBarberName(selectedBarber)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Scissors className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    <strong>Serviço:</strong> {selectedService.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Data:</strong> {formatDate(selectedDate)}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Horário:</strong> {selectedTime}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Duração:</strong> {selectedService.duration} minutos
                </div>
                <div className="text-lg font-bold text-[#00657C]">
                  <strong>Valor:</strong> {formatPrice(selectedService.price)}
                </div>
                {selectedBarber.specialty && (
                  <div className="text-sm text-gray-600">
                    <strong>Especialidade:</strong> {selectedBarber.specialty}
                  </div>
                )}
                {selectedBarber.experience_years > 0 && (
                  <div className="text-sm text-gray-600">
                    <strong>Experiência:</strong> {selectedBarber.experience_years} anos
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onBack}
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
  );
};