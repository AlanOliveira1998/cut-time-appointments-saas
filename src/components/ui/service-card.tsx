import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Scissors, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  barber_id: string;
  name: string;
  duration: number;
  price: number;
  created_at: string;
}

interface Barber {
  id: string;
  name: string;
  specialty?: string;
}

interface ServiceCardProps {
  service: Service;
  barber?: Barber;
  variant?: 'default' | 'selectable' | 'compact';
  onSelect?: (service: Service) => void;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  className?: string;
  showActions?: boolean;
}

const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null || isNaN(price)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  barber,
  variant = 'default',
  onSelect,
  onEdit,
  onDelete,
  className,
  showActions = true
}) => {
  const isSelectable = variant === 'selectable';
  const isCompact = variant === 'compact';

  const handleCardClick = () => {
    if (isSelectable && onSelect) {
      onSelect(service);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(service);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(service);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(service);
    }
  };

  if (isCompact) {
    return (
      <div
        className={cn(
          'border rounded-lg p-4 hover:shadow-sm transition-shadow',
          isSelectable && 'cursor-pointer hover:shadow-md hover:border-blue-300',
          className
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-lg">{service.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{service.duration}min</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>{formatPrice(service.price)}</span>
              </Badge>
            </div>
          </div>
          {showActions && (
            <div className="flex space-x-1">
              {isSelectable && (
                <Button
                  size="sm"
                  className="barber-button-primary"
                  onClick={handleSelectClick}
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Selecionar
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEditClick}
                >
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteClick}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-all duration-200',
        isSelectable && 'cursor-pointer hover:border-blue-300 hover:bg-blue-50/50',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scissors className="w-5 h-5 text-blue-600" />
          <span>{service.name}</span>
        </CardTitle>
        {barber && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Barbeiro: {barber.name}</span>
            {barber.specialty && (
              <Badge variant="secondary" className="text-xs">
                {barber.specialty}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{service.duration} minutos</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1 font-semibold text-lg">
              <span>{formatPrice(service.price)}</span>
            </Badge>
          </div>
          {showActions && (
            <div className="flex space-x-2">
              {isSelectable && (
                <Button
                  className="barber-button-primary"
                  onClick={handleSelectClick}
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Selecionar
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={handleEditClick}
                >
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  onClick={handleDeleteClick}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
