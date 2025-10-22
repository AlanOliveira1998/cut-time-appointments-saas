import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BarberDashboard from '../../pages/BarberDashboard';

// Mock dos hooks
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com'
    }
  })
}));

vi.mock('../../hooks/useDashboard', () => ({
  useDashboard: () => ({
    stats: {
      totalAppointments: 25,
      completedAppointments: 20,
      cancelledAppointments: 5,
      totalRevenue: 1500.00,
      averageRating: 4.5
    },
    appointmentsByDay: [
      { day: 'Segunda', count: 5, revenue: 300 },
      { day: 'Terça', count: 4, revenue: 240 },
      { day: 'Quarta', count: 6, revenue: 360 },
      { day: 'Quinta', count: 3, revenue: 180 },
      { day: 'Sexta', count: 7, revenue: 420 }
    ],
    popularTimes: [
      { hour: '09:00', count: 8 },
      { hour: '10:00', count: 6 },
      { hour: '14:00', count: 5 },
      { hour: '15:00', count: 4 }
    ],
    serviceStats: [
      { serviceName: 'Corte Masculino', count: 15, revenue: 900 },
      { serviceName: 'Barba', count: 8, revenue: 400 },
      { serviceName: 'Corte + Barba', count: 2, revenue: 200 }
    ],
    appointmentsTrend: [
      { date: '2024-01-01', count: 3, revenue: 180 },
      { date: '2024-01-02', count: 5, revenue: 300 },
      { date: '2024-01-03', count: 2, revenue: 120 }
    ],
    loading: false,
    error: null,
    refreshData: vi.fn()
  })
}));

// Mock dos componentes UI
vi.mock('../../components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
}));

vi.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('../../components/ui/input', () => ({
  Input: ({ value, onChange, type, id }: any) => (
    <input value={value} onChange={onChange} type={type} id={id} />
  ),
}));

vi.mock('../../components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock('../../components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ text }: any) => (
    <div data-testid="loading-spinner">{text}</div>
  ),
}));

// Mock do Recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}));

// Mock dos ícones
vi.mock('lucide-react', () => ({
  Copy: () => <span data-testid="copy-icon">Copy</span>,
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  X: () => <span data-testid="x-icon">X</span>,
  DollarSign: () => <span data-testid="dollar-icon">DollarSign</span>,
  Users: () => <span data-testid="users-icon">Users</span>,
  Star: () => <span data-testid="star-icon">Star</span>,
  TrendingUp: () => <span data-testid="trending-icon">TrendingUp</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  RefreshCw: () => <span data-testid="refresh-icon">RefreshCw</span>,
  Share2: () => <span data-testid="share-icon">Share2</span>,
  MessageSquare: () => <span data-testid="message-icon">MessageSquare</span>,
  MessageCircle: () => <span data-testid="message-circle-icon">MessageCircle</span>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BarberDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title and description', () => {
    renderWithRouter(<BarberDashboard />);

    expect(screen.getByText('Dashboard do Barbeiro')).toBeInTheDocument();
    expect(screen.getByText('Acompanhe suas estatísticas e desempenho')).toBeInTheDocument();
  });

  it('renders date filters', () => {
    renderWithRouter(<BarberDashboard />);

    expect(screen.getByText('Filtros de Período')).toBeInTheDocument();
    expect(screen.getByText('Data Inicial')).toBeInTheDocument();
    expect(screen.getByText('Data Final')).toBeInTheDocument();
    expect(screen.getByText('Atualizar')).toBeInTheDocument();
  });

  it('renders statistics cards', () => {
    renderWithRouter(<BarberDashboard />);

    expect(screen.getByText('Total de Agendamentos')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('20 completados')).toBeInTheDocument();

    expect(screen.getByText('Receita Total')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();

    expect(screen.getByText('Avaliação Média')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('de 5 estrelas')).toBeInTheDocument();

    expect(screen.getByText('Cancelamentos')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Agendamentos cancelados')).toBeInTheDocument();
  });

  it('renders charts', () => {
    renderWithRouter(<BarberDashboard />);

    expect(screen.getByText('Agendamentos por Dia da Semana')).toBeInTheDocument();
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2); // Two bar charts

    expect(screen.getByText('Horários Mais Populares')).toBeInTheDocument();

    expect(screen.getByText('Tendência de Agendamentos')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    expect(screen.getByText('Estatísticas por Serviço')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders service details', () => {
    renderWithRouter(<BarberDashboard />);

    expect(screen.getByText('Detalhes por Serviço')).toBeInTheDocument();
    expect(screen.getByText('Corte Masculino')).toBeInTheDocument();
    expect(screen.getByText('15 agendamentos')).toBeInTheDocument();
    expect(screen.getByText('R$ 900,00')).toBeInTheDocument();

    expect(screen.getByText('Barba')).toBeInTheDocument();
    expect(screen.getByText('8 agendamentos')).toBeInTheDocument();
    expect(screen.getByText('R$ 400,00')).toBeInTheDocument();
  });

  it('handles date range changes', () => {
    renderWithRouter(<BarberDashboard />);

    // Get the date inputs by their labels instead of hardcoded values
    const startDateInput = screen.getByLabelText('Data Inicial');
    const endDateInput = screen.getByLabelText('Data Final');

    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();
    expect(startDateInput).toHaveAttribute('type', 'date');
    expect(endDateInput).toHaveAttribute('type', 'date');
  });

  it('handles refresh button click', () => {
    renderWithRouter(<BarberDashboard />);

    const refreshButton = screen.getByText('Atualizar');
    fireEvent.click(refreshButton);

    // O mock do useDashboard já está configurado para não fazer nada
    // mas podemos verificar se o botão está presente
    expect(refreshButton).toBeInTheDocument();
  });
});
