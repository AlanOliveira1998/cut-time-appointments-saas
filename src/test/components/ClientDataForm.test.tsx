import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientDataForm } from '../../components/booking/components/ClientDataForm';

// Mock dos componentes UI
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
  CardDescription: ({ children, className }: any) => <p className={className}>{children}</p>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, type }: any) => (
    <button onClick={onClick} className={className} type={type}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, type, id }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
      id={id}
    />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

// Mock dos ícones
vi.mock('lucide-react', () => ({
  User: () => <span data-testid="user-icon">User</span>,
  Phone: () => <span data-testid="phone-icon">Phone</span>,
  Scissors: () => <span data-testid="scissors-icon">Scissors</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
}));

// Mock das funções utilitárias
vi.mock('../../components/booking/utils/bookingUtils', () => ({
  formatPrice: (price: number) => `R$ ${price.toFixed(2)}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
}));

const mockService = {
  id: '1',
  barber_id: '1',
  name: 'Corte Masculino',
  duration: 30,
  price: 35.00,
  created_at: '2024-01-01T00:00:00Z',
};

const mockBarber = {
  id: '1',
  profile_id: '1',
  specialty: 'Cortes Modernos',
  experience_years: 5,
  is_active: true,
  role: 'owner' as const,
  employee_name: 'João Silva',
  employee_phone: '11999999999',
  profiles: {
    name: 'João Silva',
    phone: '11999999999',
  },
};

describe('ClientDataForm', () => {
  const defaultProps = {
    selectedBarber: mockBarber,
    selectedService: mockService,
    selectedDate: '2024-01-15',
    selectedTime: '14:00',
    clientName: '',
    clientPhone: '',
    onClientNameChange: vi.fn(),
    onClientPhoneChange: vi.fn(),
    onBack: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ClientDataForm {...defaultProps} />);

    expect(screen.getByText('Seus dados')).toBeInTheDocument();
    expect(screen.getByText('Nome completo')).toBeInTheDocument();
    expect(screen.getByText('Telefone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('(11) 99999-9999')).toBeInTheDocument();
  });

  it('displays service and barber information', () => {
    render(<ClientDataForm {...defaultProps} />);

    expect(screen.getByText('Corte Masculino')).toBeInTheDocument();
    expect(screen.getByText('R$ 35.00')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('14/01/2024')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
  });

  it('calls onClientNameChange when name input changes', () => {
    render(<ClientDataForm {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });

    expect(defaultProps.onClientNameChange).toHaveBeenCalledWith('João Silva');
  });

  it('calls onClientPhoneChange when phone input changes', () => {
    render(<ClientDataForm {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText('(11) 99999-9999');
    fireEvent.change(phoneInput, { target: { value: '11999999999' } });

    expect(defaultProps.onClientPhoneChange).toHaveBeenCalledWith('11999999999');
  });

  it('calls onBack when back button is clicked', () => {
    render(<ClientDataForm {...defaultProps} />);

    const backButton = screen.getByText('Voltar');
    fireEvent.click(backButton);

    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<ClientDataForm {...defaultProps} />);

    const submitButton = screen.getByText('Confirmar Agendamento');
    fireEvent.click(submitButton);

    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('displays client name when provided', () => {
    render(<ClientDataForm {...defaultProps} clientName="João Silva" />);

    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    expect(nameInput).toHaveValue('João Silva');
  });

  it('displays client phone when provided', () => {
    render(<ClientDataForm {...defaultProps} clientPhone="11999999999" />);

    const phoneInput = screen.getByPlaceholderText('(11) 99999-9999');
    expect(phoneInput).toHaveValue('11999999999');
  });

  it('shows service duration information', () => {
    render(<ClientDataForm {...defaultProps} />);

    expect(screen.getByText('30 minutos')).toBeInTheDocument();
  });

  it('displays barber specialty when available', () => {
    render(<ClientDataForm {...defaultProps} />);

    expect(screen.getByText('Cortes Modernos')).toBeInTheDocument();
  });

  it('handles form submission with empty fields', () => {
    render(<ClientDataForm {...defaultProps} />);

    const submitButton = screen.getByText('Confirmar Agendamento');
    fireEvent.click(submitButton);

    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('renders with different service data', () => {
    const differentService = {
      ...mockService,
      name: 'Barba',
      duration: 20,
      price: 25.00,
    };

    render(<ClientDataForm {...defaultProps} selectedService={differentService} />);

    expect(screen.getByText('Barba')).toBeInTheDocument();
    expect(screen.getByText('R$ 25.00')).toBeInTheDocument();
    expect(screen.getByText('20 minutos')).toBeInTheDocument();
  });

  it('renders with different barber data', () => {
    const differentBarber = {
      ...mockBarber,
      employee_name: 'Pedro Santos',
      profiles: {
        name: 'Pedro Santos',
        phone: '11888888888',
      },
    };

    render(<ClientDataForm {...defaultProps} selectedBarber={differentBarber} />);

    expect(screen.getByText('Pedro Santos')).toBeInTheDocument();
  });
});
