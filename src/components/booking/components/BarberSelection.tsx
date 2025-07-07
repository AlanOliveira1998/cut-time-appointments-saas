
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

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

interface BarberSelectionProps {
  barbers: Barber[];
  onBarberSelect: (barber: Barber) => void;
}

export const BarberSelection: React.FC<BarberSelectionProps> = ({
  barbers,
  onBarberSelect
}) => {
  return (
    <Card className="barber-card">
      <CardHeader>
        <CardTitle>Escolha o barbeiro</CardTitle>
        <CardDescription>
          Selecione o profissional de sua preferência
        </CardDescription>
      </CardHeader>
      <CardContent>
        {barbers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum barbeiro disponível no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                onClick={() => onBarberSelect(barber)}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow hover:border-[#00657C]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        {barber.profiles?.name || barber.employee_name || 'Nome não informado'}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {barber.specialty && (
                          <Badge variant="secondary">
                            {barber.specialty}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {barber.experience_years} anos de experiência
                        </Badge>
                        <Badge variant={barber.role === 'owner' ? "default" : "outline"}>
                          {barber.role === 'owner' ? 'Dono' : 'Funcionário'}
                        </Badge>
                      </div>
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
