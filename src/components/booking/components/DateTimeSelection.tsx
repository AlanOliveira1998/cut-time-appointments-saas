import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Service } from '../hooks/useBookingData';
import { formatPrice, getDateLimits } from '../utils/bookingUtils';

interface DateTimeSelectionProps {
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
  availableSlots: string[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedService,
  selectedDate,
  selectedTime,
  availableSlots,
  onDateChange,
  onTimeChange,
  onBack,
  onContinue
}) => {
  const { today, maxDateString } = getDateLimits();

  return (
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
            onChange={(e) => onDateChange(e.target.value)}
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
            disabled={!selectedDate || !selectedTime}
            className="flex-1 barber-button-primary"
          >
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};