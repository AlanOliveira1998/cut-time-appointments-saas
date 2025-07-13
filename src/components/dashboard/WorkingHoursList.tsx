
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Save, RefreshCw } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type WorkingHour = Tables<'working_hours'>;
type Barber = Tables<'barbers'> & {
  profiles?: {
    name: string;
  } | null;
};

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export const WorkingHoursList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<string>('');

  // Carregar barbeiros e horários
  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar barbeiros (owner + funcionários)
      const { data: barbersData, error: barbersError } = await supabase
        .from('barbers')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('is_active', true)
        .order('role', { ascending: false }); // Owner primeiro

      if (barbersError) throw barbersError;

      setBarbers(barbersData || []);
      
      if (barbersData && barbersData.length > 0) {
        setSelectedBarber(barbersData[0].id);
      }

      // Carregar horários de trabalho
      const { data: hoursData, error: hoursError } = await supabase
        .from('working_hours')
        .select('*')
        .order('day_of_week');

      if (hoursError) throw hoursError;
      setWorkingHours(hoursData || []);

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Obter horários para um barbeiro específico
  const getBarberHours = (barberId: string) => {
    return workingHours.filter(hour => hour.barber_id === barberId);
  };

  // Obter horário para um dia específico
  const getDayHours = (barberId: string, dayOfWeek: number) => {
    return workingHours.find(hour => 
      hour.barber_id === barberId && hour.day_of_week === dayOfWeek
    );
  };

  // Salvar horários
  const saveWorkingHours = async () => {
    if (!selectedBarber) return;

    try {
      setSaving(true);

      // Obter horários atuais do barbeiro selecionado
      const currentHours = getBarberHours(selectedBarber);
      
      // Preparar novos horários baseados no estado atual
      const newHours: WorkingHour[] = [];
      
      DAYS_OF_WEEK.forEach(day => {
        const dayHours = getDayHours(selectedBarber, day.value);
        if (dayHours) {
          newHours.push(dayHours);
        }
      });

      // Deletar horários existentes do barbeiro
      await supabase
        .from('working_hours')
        .delete()
        .eq('barber_id', selectedBarber);

      // Inserir novos horários
      if (newHours.length > 0) {
        const { error } = await supabase
          .from('working_hours')
          .insert(newHours);

        if (error) throw error;
      }

      // Recarregar dados
      await loadData();

      toast({
        title: "Horários salvos",
        description: "Os horários de trabalho foram atualizados com sucesso.",
      });

    } catch (error: any) {
      console.error('Error saving working hours:', error);
      toast({
        title: "Erro ao salvar horários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Atualizar horário de um dia
  const updateDayHours = (dayOfWeek: number, field: 'start_time' | 'end_time' | 'is_active', value: string | boolean) => {
    const existingHour = getDayHours(selectedBarber, dayOfWeek);
    
    if (existingHour) {
      // Atualizar horário existente
      setWorkingHours(prev => prev.map(hour => 
        hour.id === existingHour.id 
          ? { ...hour, [field]: value }
          : hour
      ));
    } else {
      // Criar novo horário
      const newHour: WorkingHour = {
        id: `temp-${selectedBarber}-${dayOfWeek}`,
        barber_id: selectedBarber,
        day_of_week: dayOfWeek,
        start_time: field === 'start_time' ? value as string : '09:00',
        end_time: field === 'end_time' ? value as string : '18:00',
        is_active: field === 'is_active' ? value as boolean : true,
      };
      
      setWorkingHours(prev => [...prev, newHour]);
    }
  };

  // Obter nome do barbeiro
  const getBarberName = (barber: Barber) => {
    if (barber.role === 'owner') {
      return barber.profiles?.name || 'Proprietário';
    }
    return barber.employee_name || 'Funcionário';
  };

  if (loading) {
    return (
      <Card className="barber-card">
        <CardContent className="p-6">
          <div className="text-center">Carregando horários...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="barber-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Horários de Trabalho</CardTitle>
            <CardDescription>
              Configure os horários de trabalho para cada barbeiro
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={loadData}
              title="Recarregar dados"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
            <Button 
              onClick={saveWorkingHours}
              disabled={saving || !selectedBarber}
              className="barber-button-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Horários'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {barbers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Nenhum barbeiro encontrado</p>
            <p className="text-sm text-gray-400">
              Adicione barbeiros primeiro para configurar seus horários
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Seletor de barbeiro */}
            <div className="space-y-2">
              <Label htmlFor="barber-select">Selecionar Barbeiro</Label>
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {getBarberName(barber)} {barber.role === 'owner' ? '(Proprietário)' : '(Funcionário)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Horários por dia da semana */}
            {selectedBarber && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Horários de {getBarberName(barbers.find(b => b.id === selectedBarber)!)}</h3>
                
                <div className="grid gap-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayHours = getDayHours(selectedBarber, day.value);
                    const isActive = dayHours?.is_active ?? false;
                    
                    return (
                      <div key={day.value} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={isActive}
                              onCheckedChange={(checked) => updateDayHours(day.value, 'is_active', checked)}
                            />
                            <Label className="font-medium">{day.label}</Label>
                          </div>
                          {isActive && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Horário de trabalho</span>
                            </div>
                          )}
                        </div>
                        
                        {isActive && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`start-${day.value}`}>Horário de início</Label>
                              <Select
                                value={dayHours?.start_time || '09:00'}
                                onValueChange={(value) => updateDayHours(day.value, 'start_time', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`end-${day.value}`}>Horário de fim</Label>
                              <Select
                                value={dayHours?.end_time || '18:00'}
                                onValueChange={(value) => updateDayHours(day.value, 'end_time', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
