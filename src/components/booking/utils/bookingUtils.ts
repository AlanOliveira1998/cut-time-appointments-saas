import { Service, WorkingHour, Appointment } from '../hooks/useBookingData';

export const calculateAvailableSlots = (
  selectedService: Service | null,
  selectedDate: string,
  workingHours: WorkingHour[],
  appointments: Appointment[],
  services: Service[]
): string[] => {
  if (!selectedService || !selectedDate || !workingHours.length) return [];
  
  const date = new Date(selectedDate + 'T00:00:00');
  const dayOfWeek = date.getDay();
  
  // Encontrar horário de funcionamento para o dia
  const dayWorkingHour = workingHours.find(wh => wh.day_of_week === dayOfWeek && wh.is_active);
  
  if (!dayWorkingHour) {
    return [];
  }
  
  // Gerar slots de 30 minutos
  const slots: string[] = [];
  const [startHour, startMinute] = dayWorkingHour.start_time.split(':').map(Number);
  const [endHour, endMinute] = dayWorkingHour.end_time.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  for (let time = startTime; time < endTime; time += 30) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Verificar se o slot não conflita com agendamentos existentes
    const hasConflict = appointments.some(apt => {
      const aptStartTime = apt.appointment_time;
      const aptService = services.find(s => s.id === apt.service_id);
      if (!aptService) return false;
      
      const [aptHour, aptMinute] = aptStartTime.split(':').map(Number);
      const aptStart = aptHour * 60 + aptMinute;
      const aptEnd = aptStart + aptService.duration;
      
      const slotEnd = time + selectedService.duration;
      
      return !(slotEnd <= aptStart || time >= aptEnd);
    });
    
    if (!hasConflict && time + selectedService.duration <= endTime) {
      slots.push(timeString);
    }
  }
  
  return slots;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getDateLimits = () => {
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];
  return { today, maxDateString };
};