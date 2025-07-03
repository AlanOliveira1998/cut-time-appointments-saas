import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Phone } from 'lucide-react';
import { Service } from '../hooks/useBookingData';
import { formatPrice, formatDate } from '../utils/bookingUtils';

interface ClientDataFormProps {
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
  return (
    <Card className="barber-card">
      <CardHeader>
        <CardTitle>Seus dados</CardTitle>
        <CardDescription>
          Preencha seus dados para finalizar o agendamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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