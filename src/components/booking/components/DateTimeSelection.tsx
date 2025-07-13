import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Service } from '../hooks/useBookingData';
import { formatPrice, getDateLimits } from '../utils/bookingUtils';
import { Calendar, Clock, User } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type WorkingHour = Tables<'working_hours'>;

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
  working_hours?: WorkingHour[];
}

interface DateTimeSelectionProps {
  selectedService: Service;
  selectedBarber: Barber;
  selectedDate: string;
  selectedTime: string;
  availableSlots: string[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
];

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedService,
  selectedBarber,
  selectedDate,
  selectedTime,
  availableSlots,
  onDateChange,
  onTimeChange,
  onBack,
  onContinue
}) => {
  console.log('DateTimeSelection - selectedBarber:', selectedBarber);
  console.log('DateTimeSelection - selectedService:', selectedService);
  
  const { today, maxDateString } = getDateLimits();

  const getBarberName = (barber: Barber) => {
    if (!barber) return 'Barbeiro não selecionado';
    return barber.profiles?.name || barber.employee_name || 'Nome não informado';
  };

  // Obter horário de trabalho para a data selecionada
  const getSelectedDateHours = () => {
    if (!selectedDate || !selectedBarber) return null;
    
    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj.getDay();
    
    return selectedBarber.working_hours?.find(hour => 
      hour.day_of_week === dayOfWeek && hour.is_active
    );
  };

  // Formatar horário
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  // Verificar se a data selecionada é hoje
  const isToday = selectedDate === today;

  const selectedDateHours = getSelectedDateHours();

  // Se não há barbeiro selecionado, mostrar mensagem de erro
  if (!selectedBarber) {
    return (
      <Card className="barber-card">
        <CardContent className="p-6">
          <div className="text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Erro: Barbeiro não selecionado</p>
            <p className="text-sm text-gray-400 mt-2">Por favor, volte e selecione um barbeiro</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="barber-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-[#00657C]" />
          <span>Escolha data e horário</span>
        </CardTitle>
        <CardDescription>
          <div className="space-y-1">
            <p>Serviço: {selectedService.name} - {formatPrice(selectedService.price)}</p>
            <p>Barbeiro: {getBarberName(selectedBarber)}</p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações do barbeiro */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Horários de {getBarberName(selectedBarber)}</span>
          </div>
          
          {selectedDateHours ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-600 text-white">
                  {isToday ? 'Hoje' : DAYS_OF_WEEK.find(day => day.value === new Date(selectedDate).getDay())?.short}
                </Badge>
                <span className="text-sm text-blue-800">
                  {formatTime(selectedDateHours.start_time)} - {formatTime(selectedDateHours.end_time)}
                </span>
              </div>
              <p className="text-xs text-blue-700">
                {selectedBarber.working_hours?.filter(hour => hour.is_active).length || 0} dias de trabalho por semana
              </p>
            </div>
          ) : (
            <div className="text-sm text-red-700">
              <p>⚠️ {getBarberName(selectedBarber)} não trabalha nesta data</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={today}
            max={maxDateString}
            className="w-full"
          />
        </div>
        
        {selectedDate && selectedDateHours && (
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Horários disponíveis</span>
            </Label>
            {availableSlots.length === 0 ? (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 text-sm">
                  Nenhum horário disponível para esta data.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Horário de trabalho: {formatTime(selectedDateHours.start_time)} - {formatTime(selectedDateHours.end_time)}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    onClick={() => onTimeChange(slot)}
                    className={selectedTime === slot ? "barber-button-primary" : ""}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedDate && !selectedDateHours && (
          <div className="text-center py-4 bg-red-50 rounded-lg">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-red-600 text-sm font-medium">
              {getBarberName(selectedBarber)} não trabalha nesta data
            </p>
            <p className="text-xs text-red-500 mt-1">
              Selecione outra data para continuar
            </p>
          </div>
        )}
        
        <div className="flex space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button 
            onClick={onContinue}
            disabled={!selectedDate || !selectedTime || !selectedDateHours}
            className="flex-1 barber-button-primary"
          >
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};