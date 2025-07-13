
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Star, Clock, Award, Search, Filter, Calendar } from 'lucide-react';
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

interface BarberSelectionProps {
  barbers: Barber[];
  onBarberSelect: (barber: Barber) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom', full: 'Domingo' },
  { value: 1, label: 'Seg', full: 'Segunda' },
  { value: 2, label: 'Ter', full: 'Terça' },
  { value: 3, label: 'Qua', full: 'Quarta' },
  { value: 4, label: 'Qui', full: 'Quinta' },
  { value: 5, label: 'Sex', full: 'Sexta' },
  { value: 6, label: 'Sáb', full: 'Sábado' },
];

export const BarberSelection: React.FC<BarberSelectionProps> = ({
  barbers,
  onBarberSelect
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<'all' | 'owner' | 'employee'>('all');

  const getBarberName = (barber: Barber) => {
    return barber.profiles?.name || barber.employee_name || 'Nome não informado';
  };

  const getBarberPhone = (barber: Barber) => {
    return barber.profiles?.phone || barber.employee_phone || '';
  };

  // Obter horários de trabalho para um barbeiro
  const getWorkingHours = (barber: Barber) => {
    return barber.working_hours || [];
  };

  // Obter horário para um dia específico
  const getDayHours = (barber: Barber, dayOfWeek: number) => {
    return getWorkingHours(barber).find(hour => hour.day_of_week === dayOfWeek);
  };

  // Formatar horário
  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove segundos se houver
  };

  // Verificar se o barbeiro trabalha hoje
  const getTodayHours = (barber: Barber) => {
    const today = new Date().getDay();
    return getDayHours(barber, today);
  };

  // Filtrar barbeiros baseado na busca e filtros
  const filteredBarbers = barbers.filter(barber => {
    const barberName = getBarberName(barber);
    const barberSpecialty = barber.specialty || '';
    
    // Filtro por busca
    const matchesSearch = searchTerm === '' || 
      barberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barberSpecialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por role
    const matchesRole = filterRole === 'all' || barber.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <Card className="barber-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5 text-[#00657C]" />
          <span>Escolha o barbeiro</span>
        </CardTitle>
        <CardDescription>
          Selecione o profissional de sua preferência para realizar o serviço
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Buscar barbeiro</span>
            </Label>
            <Input
              id="search"
              placeholder="Nome ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="filter" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtrar por</span>
            </Label>
            <Select value={filterRole} onValueChange={(value: 'all' | 'owner' | 'employee') => setFilterRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um filtro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os barbeiros</SelectItem>
                <SelectItem value="owner">Apenas donos</SelectItem>
                <SelectItem value="employee">Apenas funcionários</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredBarbers.length} barbeiro{filteredBarbers.length !== 1 ? 's' : ''} encontrado{filteredBarbers.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Award className="w-3 h-3 text-yellow-500" />
              <span>{barbers.filter(b => b.role === 'owner').length} dono{barbers.filter(b => b.role === 'owner').length !== 1 ? 's' : ''}</span>
            </span>
            <span className="flex items-center space-x-1">
              <User className="w-3 h-3 text-blue-500" />
              <span>{barbers.filter(b => b.role === 'employee').length} funcionário{barbers.filter(b => b.role === 'employee').length !== 1 ? 's' : ''}</span>
            </span>
          </div>
        </div>

        {/* Lista de barbeiros */}
        {filteredBarbers.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">
              {searchTerm || filterRole !== 'all' 
                ? 'Nenhum barbeiro encontrado com os filtros aplicados.' 
                : 'Nenhum barbeiro disponível no momento.'
              }
            </p>
            <p className="text-sm text-gray-400 mt-2">Tente ajustar os filtros ou entre em contato conosco.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBarbers.map((barber) => {
              const todayHours = getTodayHours(barber);
              const workingDays = getWorkingHours(barber).filter(hour => hour.is_active).length;
              
              return (
                <div
                  key={barber.id}
                  onClick={() => onBarberSelect(barber)}
                  className="border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#00657C] hover:bg-blue-50/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#00657C] to-[#004A5A] rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-gray-900 mb-2">
                          {getBarberName(barber)}
                        </h3>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          {barber.role === 'owner' && (
                            <Badge variant="default" className="bg-[#00657C] text-white">
                              <Award className="w-3 h-3 mr-1" />
                              Dono
                            </Badge>
                          )}
                          {barber.role === 'employee' && (
                            <Badge variant="outline">
                              <User className="w-3 h-3 mr-1" />
                              Funcionário
                            </Badge>
                          )}
                          {barber.experience_years > 0 && (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              {barber.experience_years} anos
                            </Badge>
                          )}
                        </div>

                        {barber.specialty && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Especialidade:</span> {barber.specialty}
                            </p>
                          </div>
                        )}

                        {/* Horários de trabalho */}
                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Horários de trabalho</span>
                          </div>
                          
                          {workingDays > 0 ? (
                            <div className="space-y-2">
                              {/* Horário de hoje */}
                              {todayHours && (
                                <div className="flex items-center space-x-2">
                                  <Badge variant="default" className="bg-green-600 text-white text-xs">
                                    Hoje
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {formatTime(todayHours.start_time)} - {formatTime(todayHours.end_time)}
                                  </span>
                                </div>
                              )}
                              
                              {/* Resumo da semana */}
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">
                                  {workingDays} dia{workingDays !== 1 ? 's' : ''} por semana
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {getWorkingHours(barber)
                                    .filter(hour => hour.is_active)
                                    .map(hour => DAYS_OF_WEEK.find(day => day.value === hour.day_of_week)?.label)
                                    .join(', ')
                                  }
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">Horários não configurados</p>
                          )}
                        </div>

                        {getBarberPhone(barber) && (
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Contato:</span> {getBarberPhone(barber)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="barber-button-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBarberSelect(barber);
                      }}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Selecionar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
