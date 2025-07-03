
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock } from 'lucide-react';

interface WorkingHour {
  id: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

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
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWorkingHours();
    }
  }, [user]);

  const loadWorkingHours = async () => {
    if (!user) return;
    
    try {
      // Primeiro, verificar se o usuário tem um barbeiro associado
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (barberError || !barberData) {
        // Se não existe barbeiro, criar um
        const { data: newBarber, error: createBarberError } = await supabase
          .from('barbers')
          .insert([{
            profile_id: user.id,
            specialty: 'Geral',
            experience_years: 0,
            is_active: true
          }])
          .select()
          .single();

        if (createBarberError) {
          console.error('Error creating barber:', createBarberError);
          return;
        }

        await createDefaultWorkingHours(newBarber.id);
        return;
      }

      const { data, error } = await supabase
        .from('working_hours')
        .select('*')
        .eq('barber_id', barberData.id)
        .order('day_of_week');

      if (error) {
        console.error('Error loading working hours:', error);
        return;
      }

      // Se não existir horários, criar padrão
      if (!data || data.length === 0) {
        await createDefaultWorkingHours(barberData.id);
      } else {
        setWorkingHours(data);
      }
    } catch (error) {
      console.error('Error loading working hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultWorkingHours = async (barberId: string) => {
    const defaultHours = DAYS_OF_WEEK.map(day => ({
      barber_id: barberId,
      day_of_week: day.id,
      start_time: '08:00',
      end_time: day.id === 0 ? '17:00' : '18:00',
      is_active: day.id !== 0 // Domingo desabilitado por padrão
    }));

    try {
      const { data, error } = await supabase
        .from('working_hours')
        .insert(defaultHours)
        .select();

      if (error) {
        console.error('Error creating default working hours:', error);
        return;
      }

      setWorkingHours(data || []);
    } catch (error) {
      console.error('Error creating default working hours:', error);
    }
  };

  const updateWorkingHour = async (dayOfWeek: number, field: keyof WorkingHour, value: any) => {
    if (!user) return;

    try {
      // Buscar o ID do barbeiro baseado no profile_id
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (barberError || !barberData) {
        console.error('Error finding barber:', barberError);
        return;
      }

      const { error } = await supabase
        .from('working_hours')
        .update({ [field]: value })
        .eq('barber_id', barberData.id)
        .eq('day_of_week', dayOfWeek);

      if (error) {
        console.error('Error updating working hour:', error);
        toast({
          title: "Erro ao atualizar horário",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Atualizar estado local
      setWorkingHours(prev => prev.map(wh => 
        wh.day_of_week === dayOfWeek 
          ? { ...wh, [field]: value }
          : wh
      ));

      toast({
        title: "Horário atualizado!",
        description: "Seus horários de funcionamento foram salvos.",
      });
    } catch (error: any) {
      console.error('Error updating working hour:', error);
      toast({
        title: "Erro ao atualizar horário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDayWorkingHour = (dayOfWeek: number): WorkingHour | undefined => {
    return workingHours.find(wh => wh.day_of_week === dayOfWeek);
  };

  if (loading) {
    return (
      <Card className="barber-card">
        <CardContent className="p-6">
          <div className="text-center">Carregando horários de funcionamento...</div>
        </CardContent>
      </Card>
    );
  }

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
                    checked={dayHour.is_active}
                    onCheckedChange={(checked) => updateWorkingHour(day.id, 'is_active', checked)}
                  />
                  <div className="min-w-[120px]">
                    <span className="font-medium">{day.name}</span>
                  </div>
                </div>
                
                {dayHour.is_active && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <Label htmlFor={`start-${day.id}`} className="text-sm">De:</Label>
                      <Input
                        id={`start-${day.id}`}
                        type="time"
                        value={dayHour.start_time}
                        onChange={(e) => updateWorkingHour(day.id, 'start_time', e.target.value)}
                        className="w-32"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`end-${day.id}`} className="text-sm">Até:</Label>
                      <Input
                        id={`end-${day.id}`}
                        type="time"
                        value={dayHour.end_time}
                        onChange={(e) => updateWorkingHour(day.id, 'end_time', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}
                
                {!dayHour.is_active && (
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
