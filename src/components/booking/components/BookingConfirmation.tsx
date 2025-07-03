import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User as UserIcon, Scissors, CheckCircle } from 'lucide-react';
import { Service, Profile } from '../hooks/useBookingData';
import { formatDate } from '../utils/bookingUtils';

interface BookingConfirmationProps {
  barber: Profile;
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  barber,
  selectedService,
  selectedDate,
  selectedTime
}) => {
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
                  <span>Serviço: {selectedService.name}</span>
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
};