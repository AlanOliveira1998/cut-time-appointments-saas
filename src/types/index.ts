
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Barber {
  id: string;
  profile_id: string;
  specialty?: string;
  experience_years: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    name: string;
    phone?: string;
  };
}

export interface Service {
  id: string;
  barber_id: string; // Mudança: barberId -> barber_id para consistência com DB
  name: string;
  duration: number; // em minutos
  price: number;
  created_at: string; // Mudança: createdAt -> created_at
}

export interface WorkingHours {
  id: string;
  barber_id: string; // Mudança: barberId -> barber_id
  day_of_week: number; // Mudança: dayOfWeek -> day_of_week (0-6, domingo-sábado)
  start_time: string; // Mudança: startTime -> start_time (HH:mm)
  end_time: string; // Mudança: endTime -> end_time (HH:mm)
  is_active: boolean; // Mudança: isActive -> is_active
}

export interface Appointment {
  id: string;
  barber_id: string; // Mudança: barberId -> barber_id
  service_id: string; // Mudança: serviceId -> service_id
  client_name: string; // Mudança: clientName -> client_name
  client_phone: string; // Mudança: clientPhone -> client_phone
  appointment_date: string; // Mudança: date -> appointment_date (YYYY-MM-DD)
  appointment_time: string; // Mudança: time -> appointment_time (HH:mm)
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string; // Mudança: createdAt -> created_at
  services?: Service; // Relação opcional com serviços
}

export interface AuthContextType {
  user: any | null; // Using Supabase User type
  session: any | null; // Using Supabase Session type
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isTrialExpired: () => boolean;
  loading: boolean;
}

export interface BookingFormData {
  service_id: string; // Mudança: serviceId -> service_id
  appointment_date: string; // Mudança: date -> appointment_date
  appointment_time: string; // Mudança: time -> appointment_time
  client_name: string; // Mudança: clientName -> client_name
  client_phone: string; // Mudança: clientPhone -> client_phone
}
