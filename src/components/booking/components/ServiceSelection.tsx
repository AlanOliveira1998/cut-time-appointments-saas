import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { Service } from '../hooks/useBookingData';
import { formatPrice } from '../utils/bookingUtils';

interface ServiceSelectionProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  services,
  onServiceSelect
}) => {
  return (
    <Card className="barber-card">
      <CardHeader>
        <CardTitle>Escolha o serviço</CardTitle>
        <CardDescription>
          Selecione o serviço que deseja agendar
        </CardDescription>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => onServiceSelect(service)}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow hover:border-[#00657C]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{service.name}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration}min</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center space-x-1 font-semibold">
                        <span>{formatPrice(service.price)}</span>
                      </Badge>
                    </div>
                  </div>
                  <Button className="barber-button-primary">
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