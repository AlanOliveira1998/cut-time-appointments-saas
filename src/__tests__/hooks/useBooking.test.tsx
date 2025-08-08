import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBooking } from '../../hooks/useBooking';
import { BookingService } from '../../services/bookingService';

// Mock do toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock do BookingService
vi.mock('../../services/bookingService', () => ({
  BookingService: {
    getBarberData: vi.fn(),
    getBarberServices: vi.fn(),
    getWorkingHours: vi.fn(),
    getAppointments: vi.fn(),
    createAppointment: vi.fn(),
    updateAppointment: vi.fn(),
    cancelAppointment: vi.fn(),
    getAppointmentStats: vi.fn(),
  },
}));

describe('useBooking', () => {
  const mockBarberId = 'test-barber-id';
  const mockBarber = {
    id: mockBarberId,
    profile_id: 'profile-1',
    specialty: 'Corte masculino',
    experience_years: 5,
    is_active: true,
    role: 'owner' as const,
    profiles: {
      id: 'profile-1',
      name: 'João Silva',
      phone: '(11) 99999-9999',
      email: 'joao@example.com',
    },
  };

  const mockServices = [
    {
      id: 'service-1',
      name: 'Corte',
      duration: 30,
      price: 25.00,
      description: 'Corte masculino',
      barber_id: mockBarberId,
    },
    {
      id: 'service-2',
      name: 'Barba',
      duration: 20,
      price: 15.00,
      description: 'Fazer a barba',
      barber_id: mockBarberId,
    },
  ];

  const mockWorkingHours = [
    {
      id: 'wh-1',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '18:00',
      is_working_day: true,
      barber_id: mockBarberId,
    },
    {
      id: 'wh-2',
      day_of_week: 2,
      start_time: '09:00',
      end_time: '18:00',
      is_working_day: true,
      barber_id: mockBarberId,
    },
  ];

  const mockAppointments = [
    {
      id: 'apt-1',
      client_name: 'Maria Silva',
      client_phone: '(11) 88888-8888',
      service_id: 'service-1',
      barber_id: mockBarberId,
      appointment_date: '2024-01-15',
      appointment_time: '10:00',
      status: 'confirmed' as const,
      created_at: '2024-01-10T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useBooking(mockBarberId));

    expect(result.current.loading).toBe(true);
    expect(result.current.barber).toBe(null);
    expect(result.current.services).toEqual([]);
    expect(result.current.workingHours).toEqual([]);
    expect(result.current.appointments).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should load barber data successfully', async () => {
    const mockGetBarberData = vi.mocked(BookingService.getBarberData);
    const mockGetBarberServices = vi.mocked(BookingService.getBarberServices);
    const mockGetWorkingHours = vi.mocked(BookingService.getWorkingHours);

    mockGetBarberData.mockResolvedValue({ data: mockBarber, error: null });
    mockGetBarberServices.mockResolvedValue({ data: mockServices, error: null });
    mockGetWorkingHours.mockResolvedValue({ data: mockWorkingHours, error: null });

    const { result } = renderHook(() => useBooking(mockBarberId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.barber).toEqual(mockBarber);
    expect(result.current.services).toEqual(mockServices);
    expect(result.current.workingHours).toEqual(mockWorkingHours);
    expect(result.current.error).toBe(null);
  });

  it('should handle barber data loading error', async () => {
    const mockGetBarberData = vi.mocked(BookingService.getBarberData);
    mockGetBarberData.mockResolvedValue({ 
      data: null, 
      error: 'Erro ao carregar dados do barbeiro' 
    });

    const { result } = renderHook(() => useBooking(mockBarberId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.barber).toBe(null);
    expect(result.current.error).toBe('Erro ao carregar dados do barbeiro');
  });

  it('should load appointments for a specific date', async () => {
    const mockGetBarberData = vi.mocked(BookingService.getBarberData);
    const mockGetBarberServices = vi.mocked(BookingService.getBarberServices);
    const mockGetWorkingHours = vi.mocked(BookingService.getWorkingHours);
    const mockGetAppointments = vi.mocked(BookingService.getAppointments);

    mockGetBarberData.mockResolvedValue({ data: mockBarber, error: null });
    mockGetBarberServices.mockResolvedValue({ data: mockServices, error: null });
    mockGetWorkingHours.mockResolvedValue({ data: mockWorkingHours, error: null });
    mockGetAppointments.mockResolvedValue({ data: mockAppointments, error: null });

    const { result } = renderHook(() => useBooking(mockBarberId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const selectedDate = '2024-01-15';
    await result.current.loadAppointments(selectedDate);

    expect(mockGetAppointments).toHaveBeenCalledWith(mockBarberId, selectedDate);
    
    // Wait for the appointments to be set in the state
    await waitFor(() => {
      expect(result.current.appointments).toEqual(mockAppointments);
    });
  });

  it('should create appointment successfully', async () => {
    const mockGetBarberData = vi.mocked(BookingService.getBarberData);
    const mockGetBarberServices = vi.mocked(BookingService.getBarberServices);
    const mockGetWorkingHours = vi.mocked(BookingService.getWorkingHours);
    const mockCreateAppointment = vi.mocked(BookingService.createAppointment);

    mockGetBarberData.mockResolvedValue({ data: mockBarber, error: null });
    mockGetBarberServices.mockResolvedValue({ data: mockServices, error: null });
    mockGetWorkingHours.mockResolvedValue({ data: mockWorkingHours, error: null });

    const newAppointment = {
      id: 'apt-2',
      client_name: 'Pedro Santos',
      client_phone: '(11) 77777-7777',
      service_id: 'service-1',
      barber_id: mockBarberId,
      appointment_date: '2024-01-16',
      appointment_time: '14:00',
      status: 'confirmed' as const,
      created_at: '2024-01-10T14:00:00Z',
    };

    mockCreateAppointment.mockResolvedValue({ data: newAppointment, error: null });

    const { result } = renderHook(() => useBooking(mockBarberId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const appointmentData = {
      client_name: 'Pedro Santos',
      client_phone: '(11) 77777-7777',
      service_id: 'service-1',
      barber_id: mockBarberId,
      appointment_date: '2024-01-16',
      appointment_time: '14:00',
      status: 'confirmed' as const,
    };

    const createdAppointment = await result.current.createAppointment(appointmentData);

    expect(mockCreateAppointment).toHaveBeenCalledWith(appointmentData);
    expect(createdAppointment).toEqual(newAppointment);
  });

  it('should handle appointment creation error', async () => {
    const mockGetBarberData = vi.mocked(BookingService.getBarberData);
    const mockGetBarberServices = vi.mocked(BookingService.getBarberServices);
    const mockGetWorkingHours = vi.mocked(BookingService.getWorkingHours);
    const mockCreateAppointment = vi.mocked(BookingService.createAppointment);

    mockGetBarberData.mockResolvedValue({ data: mockBarber, error: null });
    mockGetBarberServices.mockResolvedValue({ data: mockServices, error: null });
    mockGetWorkingHours.mockResolvedValue({ data: mockWorkingHours, error: null });
    mockCreateAppointment.mockResolvedValue({ 
      data: null, 
      error: 'Erro ao criar agendamento' 
    });

    const { result } = renderHook(() => useBooking(mockBarberId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const appointmentData = {
      client_name: 'Pedro Santos',
      client_phone: '(11) 77777-7777',
      service_id: 'service-1',
      barber_id: mockBarberId,
      appointment_date: '2024-01-16',
      appointment_time: '14:00',
      status: 'confirmed' as const,
    };

    const createdAppointment = await result.current.createAppointment(appointmentData);

    expect(createdAppointment).toBe(null);
    
    // Wait for the error state to be set
    await waitFor(() => {
      expect(result.current.error).toBe('Erro ao criar agendamento');
    });
  });

  it('should cancel appointment successfully', async () => {
    const mockGetBarberData = vi.mocked(BookingService.getBarberData);
    const mockGetBarberServices = vi.mocked(BookingService.getBarberServices);
    const mockGetWorkingHours = vi.mocked(BookingService.getWorkingHours);
    const mockCancelAppointment = vi.mocked(BookingService.cancelAppointment);

    mockGetBarberData.mockResolvedValue({ data: mockBarber, error: null });
    mockGetBarberServices.mockResolvedValue({ data: mockServices, error: null });
    mockGetWorkingHours.mockResolvedValue({ data: mockWorkingHours, error: null });

    const cancelledAppointment = {
      ...mockAppointments[0],
      status: 'cancelled' as const,
    };

    mockCancelAppointment.mockResolvedValue({ data: cancelledAppointment, error: null });

    const { result } = renderHook(() => useBooking(mockBarberId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const success = await result.current.cancelAppointment('apt-1');

    expect(mockCancelAppointment).toHaveBeenCalledWith('apt-1');
    expect(success).toBe(true);
  });

  it('should get appointment statistics', async () => {
    const mockGetBarberData = vi.mocked(BookingService.getBarberData);
    const mockGetBarberServices = vi.mocked(BookingService.getBarberServices);
    const mockGetWorkingHours = vi.mocked(BookingService.getWorkingHours);
    const mockGetAppointmentStats = vi.mocked(BookingService.getAppointmentStats);

    mockGetBarberData.mockResolvedValue({ data: mockBarber, error: null });
    mockGetBarberServices.mockResolvedValue({ data: mockServices, error: null });
    mockGetWorkingHours.mockResolvedValue({ data: mockWorkingHours, error: null });

    const mockStats = {
      total: 10,
      byStatus: { confirmed: 8, cancelled: 2 },
      byDate: { '2024-01-15': 3, '2024-01-16': 7 },
    };

    mockGetAppointmentStats.mockResolvedValue({ data: mockStats, error: null });

    const { result } = renderHook(() => useBooking(mockBarberId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const stats = await result.current.getAppointmentStats('2024-01-01', '2024-01-31');

    expect(mockGetAppointmentStats).toHaveBeenCalledWith(
      mockBarberId,
      '2024-01-01',
      '2024-01-31'
    );
    expect(stats).toEqual(mockStats);
  });

  it('should not load data when barberId is undefined', () => {
    const { result } = renderHook(() => useBooking(undefined));

    expect(result.current.loading).toBe(false);
    expect(result.current.barber).toBe(null);
    expect(result.current.services).toEqual([]);
    expect(result.current.workingHours).toEqual([]);
    expect(result.current.appointments).toEqual([]);
  });

  it('should handle unexpected errors gracefully', async () => {
    const mockGetBarberData = vi.mocked(BookingService.getBarberData);
    mockGetBarberData.mockRejectedValue(new Error('Unexpected error'));

    const { result } = renderHook(() => useBooking(mockBarberId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro inesperado ao carregar dados');
    expect(result.current.barber).toBe(null);
  });
});
