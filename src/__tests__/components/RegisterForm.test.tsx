import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock do toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock do AuthContext
const mockRegister = vi.fn();
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      register: mockRegister,
      login: vi.fn(),
      logout: vi.fn(),
      user: null,
      session: null,
      loading: false,
      isTrialExpired: vi.fn(),
    }),
  };
});

describe('RegisterForm', () => {
  const mockOnToggleMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegisterForm = () => {
    return render(
      <AuthProvider>
        <RegisterForm onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );
  };

  it('renders all form fields', () => {
    renderRegisterForm();

    expect(screen.getByPlaceholderText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Endereço de Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Número de Telefone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha (mín. 6 caracteres)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmar Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('updates form fields when user types', () => {
    renderRegisterForm();

    const nameInput = screen.getByPlaceholderText('Nome Completo');
    const emailInput = screen.getByPlaceholderText('Endereço de Email');
    const phoneInput = screen.getByPlaceholderText('Número de Telefone');

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '(11) 99999-9999' } });

    expect(nameInput).toHaveValue('João Silva');
    expect(emailInput).toHaveValue('joao@example.com');
    expect(phoneInput).toHaveValue('(11) 99999-9999');
  });

  it('toggles password visibility', () => {
    renderRegisterForm();

    const passwordInput = screen.getByPlaceholderText('Senha (mín. 6 caracteres)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar Senha');

    // Initially password fields should be type="password"
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Click password toggle buttons
    const passwordToggleButton = passwordInput.parentElement?.querySelector('button');
    const confirmPasswordToggleButton = confirmPasswordInput.parentElement?.querySelector('button');

    if (passwordToggleButton) {
      fireEvent.click(passwordToggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }

    if (confirmPasswordToggleButton) {
      fireEvent.click(confirmPasswordToggleButton);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    }
  });

  it('validates password length', async () => {
    renderRegisterForm();

    const nameInput = screen.getByPlaceholderText('Nome Completo');
    const emailInput = screen.getByPlaceholderText('Endereço de Email');
    const phoneInput = screen.getByPlaceholderText('Número de Telefone');
    const passwordInput = screen.getByPlaceholderText('Senha (mín. 6 caracteres)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar Senha');
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    // Fill form with short password
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '(11) 99999-9999' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it('validates password confirmation', async () => {
    renderRegisterForm();

    const nameInput = screen.getByPlaceholderText('Nome Completo');
    const emailInput = screen.getByPlaceholderText('Endereço de Email');
    const phoneInput = screen.getByPlaceholderText('Número de Telefone');
    const passwordInput = screen.getByPlaceholderText('Senha (mín. 6 caracteres)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar Senha');
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    // Fill form with mismatched passwords
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '(11) 99999-9999' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '654321' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it('submits form with valid data', async () => {
    mockRegister.mockResolvedValue(true);
    renderRegisterForm();

    const nameInput = screen.getByPlaceholderText('Nome Completo');
    const emailInput = screen.getByPlaceholderText('Endereço de Email');
    const phoneInput = screen.getByPlaceholderText('Número de Telefone');
    const passwordInput = screen.getByPlaceholderText('Senha (mín. 6 caracteres)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar Senha');
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    // Fill form with valid data
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '(11) 99999-9999' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'João Silva',
        'joao@example.com',
        '(11) 99999-9999',
        '123456'
      );
    });
  });

  it('shows loading state during submission', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    renderRegisterForm();

    const nameInput = screen.getByPlaceholderText('Nome Completo');
    const emailInput = screen.getByPlaceholderText('Endereço de Email');
    const phoneInput = screen.getByPlaceholderText('Número de Telefone');
    const passwordInput = screen.getByPlaceholderText('Senha (mín. 6 caracteres)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar Senha');
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    // Fill form with valid data
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '(11) 99999-9999' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });

    fireEvent.click(submitButton);

    expect(screen.getByText('Criando Conta...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('calls onToggleMode when switching to login', () => {
    renderRegisterForm();

    const loginButton = screen.getByText('Entrar');
    fireEvent.click(loginButton);

    expect(mockOnToggleMode).toHaveBeenCalled();
  });

  it('requires all fields to be filled', () => {
    renderRegisterForm();

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    fireEvent.click(submitButton);

    expect(mockRegister).not.toHaveBeenCalled();
  });
});
