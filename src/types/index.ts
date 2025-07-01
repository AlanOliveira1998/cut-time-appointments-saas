
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Service {
  id: string;
  barberId: string;
  name: string;
  duration: number; // em minutos
  price: number;
  createdAt: Date;
}

export interface WorkingHours {
  id: string;
  barberId: string;
  dayOfWeek: number; // 0-6 (domingo-sábado)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive: boolean;
}

export interface Appointment {
  id: string;
  barberId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  service?: Service;
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
  serviceId: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
}
