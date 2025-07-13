import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User as UserIcon, Scissors, CheckCircle, Phone, Award } from 'lucide-react';
import { Service, Profile } from '../hooks/useBookingData';
import { formatDate, formatPrice } from '../utils/bookingUtils';

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

interface BookingConfirmationProps {
  barber: Profile;
  selectedBarber: Barber;
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  barber,
  selectedBarber,
  selectedService,
  selectedDate,
  selectedTime
}) => {
  const getBarberName = (barber: Barber) => {
    return barber.profiles?.name || barber.employee_name || 'Nome não informado';
  };

  const getBarberPhone = (barber: Barber) => {
    return barber.profiles?.phone || barber.employee_phone || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Card className="barber-card text-center">
          <CardContent className="pt-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold mb-3 text-gray-900">Agendamento Confirmado!</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Seu horário foi reservado com sucesso.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 text-left border border-blue-100">
              <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                <Scissors className="w-5 h-5 text-[#00657C]" />
                <span>Detalhes do agendamento</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Barbeiro:</strong> {getBarberName(selectedBarber)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Serviço:</strong> {selectedService.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Data:</strong> {formatDate(selectedDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Horário:</strong> {selectedTime}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Duração:</strong> {selectedService.duration} minutos
                  </div>
                  <div className="text-lg font-bold text-[#00657C]">
                    <strong>Valor:</strong> {formatPrice(selectedService.price)}
                  </div>
                  {selectedBarber.specialty && (
                    <div className="text-sm">
                      <strong>Especialidade:</strong> {selectedBarber.specialty}
                    </div>
                  )}
                  {selectedBarber.experience_years > 0 && (
                    <div className="text-sm">
                      <strong>Experiência:</strong> {selectedBarber.experience_years} anos
                    </div>
                  )}
                  {selectedBarber.role === 'owner' && (
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600 font-medium">Dono da barbearia</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {getBarberPhone(selectedBarber) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>
                    Em caso de dúvidas, entre em contato com <strong>{getBarberName(selectedBarber)}</strong> pelo telefone <strong>{getBarberPhone(selectedBarber)}</strong>.
                  </span>
                </p>
              </div>
            )}
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Chegue com 10 minutos de antecedência</p>
              <p>• Em caso de cancelamento, avise com pelo menos 24h de antecedência</p>
              <p>• Traga documentos de identificação se necessário</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};