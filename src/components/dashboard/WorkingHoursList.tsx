
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '../../contexts/AuthContext';
import { WorkingHours } from '../../types';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Segunda-feira', short: 'Seg' },
  { id: 2, name: 'Terça-feira', short: 'Ter' },
  { id: 3, name: 'Quarta-feira', short: 'Qua' },
  { id: 4, name: 'Quinta-feira', short: 'Qui' },
  { id: 5, name: 'Sexta-feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' }
];

export const WorkingHoursList: React.FC = () => {
  const { user } = useAuth();
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);

  useEffect(() => {
    loadWorkingHours();
  }, [user]);

  const loadWorkingHours = () => {
    if (!user) return;
    
    const allWorkingHours = JSON.parse(localStorage.getItem('barbertime_working_hours') || '[]');
    const userWorkingHours = allWorkingHours.filter((wh: WorkingHours) => wh.barberId === user.id);
    
    // Se não existir horários, criar padrão
    if (userWorkingHours.length === 0) {
      const defaultHours: WorkingHours[] = DAYS_OF_WEEK.map(day => ({
        id: `${user.id}-${day.id}`,
        barberId: user.id,
        dayOfWeek: day.id,
        startTime: day.id === 0 ? '08:00' : '08:00', // Domingo começa mais tarde
        endTime: day.id === 0 ? '17:00' : '18:00',
        isActive: day.id !== 0 // Domingo desabilitado por padrão
      }));
      
      const updatedAllHours = [...allWorkingHours, ...defaultHours];
      localStorage.setItem('barbertime_working_hours', JSON.stringify(updatedAllHours));
      setWorkingHours(defaultHours);
    } else {
      setWorkingHours(userWorkingHours);
    }
  };

  const updateWorkingHour = (dayOfWeek: number, field: keyof WorkingHours, value: any) => {
    const allWorkingHours = JSON.parse(localStorage.getItem('barbertime_working_hours') || '[]');
    
    const updatedHours = workingHours.map(wh => {
      if (wh.dayOfWeek === dayOfWeek) {
        return { ...wh, [field]: value };
      }
      return wh;
    });
    
    // Atualizar no localStorage
    const otherBarberHours = allWorkingHours.filter((wh: WorkingHours) => wh.barberId !== user?.id);
    const newAllHours = [...otherBarberHours, ...updatedHours];
    localStorage.setItem('barbertime_working_hours', JSON.stringify(newAllHours));
    
    setWorkingHours(updatedHours);
    
    toast({
      title: "Horário atualizado!",
      description: "Seus horários de funcionamento foram salvos.",
    });
  };

  const getDayWorkingHour = (dayOfWeek: number): WorkingHours | undefined => {
    return workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
  };

  return (
    <Card className="barber-card">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-[#00657C]" />
          <div>
            <CardTitle className="text-xl">Horários de Funcionamento</CardTitle>
            <CardDescription>
              Configure os dias e horários que você atende
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayHour = getDayWorkingHour(day.id);
            if (!dayHour) return null;
            
            return (
              <div key={day.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <Switch
                    checked={dayHour.isActive}
                    onCheckedChange={(checked) => updateWorkingHour(day.id, 'isActive', checked)}
                  />
                  <div className="min-w-[120px]">
                    <span className="font-medium">{day.name}</span>
                  </div>
                </div>
                
                {dayHour.isActive && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <Label htmlFor={`start-${day.id}`} className="text-sm">De:</Label>
                      <Input
                        id={`start-${day.id}`}
                        type="time"
                        value={dayHour.startTime}
                        onChange={(e) => updateWorkingHour(day.id, 'startTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`end-${day.id}`} className="text-sm">Até:</Label>
                      <Input
                        id={`end-${day.id}`}
                        type="time"
                        value={dayHour.endTime}
                        onChange={(e) => updateWorkingHour(day.id, 'endTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}
                
                {!dayHour.isActive && (
                  <div className="text-gray-500 text-sm">
                    Fechado
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Clock className="w-5 h-5 text-[#00657C] mt-0.5" />
            <div>
              <h4 className="font-medium text-[#00657C] mb-1">Dica importante</h4>
              <p className="text-sm text-gray-600">
                Os horários configurados aqui serão usados para calcular automaticamente 
                os slots disponíveis na sua página de agendamento público.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
