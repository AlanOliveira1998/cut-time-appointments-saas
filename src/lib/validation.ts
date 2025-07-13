import { z } from 'zod';

// Schemas de validação
export const phoneSchema = z
  .string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone deve ter no máximo 15 dígitos')
  .regex(/^[\d\s\(\)\-\+]+$/, 'Telefone deve conter apenas números, espaços, parênteses, hífens e +');

export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório');

export const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(100, 'Senha muito longa');

export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

// Schema para registro de usuário
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// Schema para login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema para dados do cliente
export const clientDataSchema = z.object({
  clientName: nameSchema,
  clientPhone: phoneSchema,
});

// Schema para criação de serviço
export const serviceSchema = z.object({
  name: z.string().min(2, 'Nome do serviço deve ter pelo menos 2 caracteres'),
  duration: z.number().min(15, 'Duração mínima é 15 minutos').max(180, 'Duração máxima é 180 minutos'),
  price: z.number().min(0, 'Preço deve ser maior que 0'),
});

// Schema para dados do barbeiro
export const barberSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.optional(),
  specialty: z.string().min(2, 'Especialidade deve ter pelo menos 2 caracteres'),
  experience_years: z.number().min(0, 'Anos de experiência deve ser maior ou igual a 0'),
  is_active: z.boolean(),
});

// Schema para horário de trabalho
export const workingHourSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  is_active: z.boolean(),
});

// Funções de validação
export const validatePhone = (phone: string): string | null => {
  try {
    phoneSchema.parse(phone);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Telefone inválido';
  }
};

export const validateEmail = (email: string): string | null => {
  try {
    emailSchema.parse(email);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Email inválido';
  }
};

export const validateName = (name: string): string | null => {
  try {
    nameSchema.parse(name);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Nome inválido';
  }
};

export const validatePassword = (password: string): string | null => {
  try {
    passwordSchema.parse(password);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Senha inválida';
  }
};

// Função para formatar telefone
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Função para validar data futura
export const validateFutureDate = (date: string): string | null => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return 'Data deve ser futura';
  }
  
  return null;
};

// Função para validar horário de trabalho
export const validateWorkingHours = (startTime: string, endTime: string): string | null => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  if (start >= end) {
    return 'Horário de fim deve ser posterior ao horário de início';
  }
  
  return null;
};

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ClientDataFormData = z.infer<typeof clientDataSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type BarberFormData = z.infer<typeof barberSchema>;
export type WorkingHourFormData = z.infer<typeof workingHourSchema>; 