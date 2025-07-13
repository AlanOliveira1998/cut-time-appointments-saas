import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Scissors, User } from 'lucide-react';
import { Service } from '../hooks/useBookingData';
import { formatPrice } from '../utils/bookingUtils';

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

interface ServiceSelectionProps {
  services: Service[];
  selectedBarber: Barber | null;
  onServiceSelect: (service: Service) => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  services,
  selectedBarber,
  onServiceSelect
}) => {
  const getBarberName = (barber: Barber) => {
    return barber.profiles?.name || barber.employee_name || 'Nome não informado';
  };

  return (
    <Card className="barber-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scissors className="w-5 h-5 text-[#00657C]" />
          <span>Escolha o serviço</span>
        </CardTitle>
        <CardDescription>
          {selectedBarber ? (
            <div className="flex items-center space-x-2 mt-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>Serviços oferecidos por <strong>{getBarberName(selectedBarber)}</strong></span>
            </div>
          ) : (
            'Selecione o serviço que deseja agendar'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8">
            <Scissors className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
            <p className="text-sm text-gray-400 mt-2">Este barbeiro ainda não cadastrou seus serviços.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => onServiceSelect(service)}
                className="border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#00657C] hover:bg-blue-50/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-gray-900 mb-3">{service.name}</h3>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration} minutos</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center space-x-1 font-semibold text-lg">
                        <span>{formatPrice(service.price)}</span>
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    className="barber-button-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceSelect(service);
                    }}
                  >
                    <Scissors className="w-4 h-4 mr-2" />
                    Selecionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};