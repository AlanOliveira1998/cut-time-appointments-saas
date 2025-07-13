// Utilitários de segurança

// Rate limiting simples para formulários
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutos
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - attempt.count);
  }
  
  getResetTime(key: string): number | null {
    const attempt = this.attempts.get(key);
    return attempt ? attempt.resetTime : null;
  }
}

// Validação de força da senha
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  // Comprimento mínimo
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  // Letras maiúsculas
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione pelo menos uma letra maiúscula');
  }
  
  // Letras minúsculas
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione pelo menos uma letra minúscula');
  }
  
  // Números
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione pelo menos um número');
  }
  
  // Caracteres especiais
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione pelo menos um caractere especial');
  }
  
  return {
    isValid: score >= 3 && password.length >= 8,
    score,
    feedback
  };
};

// Sanitização de entrada
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres potencialmente perigosos
    .replace(/\s+/g, ' '); // Normaliza espaços
};

// Validação de email mais robusta
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Geração de token CSRF simples
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validação de telefone brasileiro
export const validateBrazilianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

// Formatação segura de telefone
export const formatPhoneSecurely = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Proteção contra XSS em strings
export const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Validação de data segura
export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Verificação de horário de trabalho válido
export const validateWorkingTime = (timeString: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

// Rate limiter global para a aplicação
export const globalRateLimiter = new RateLimiter(10, 60 * 1000); // 10 tentativas por minuto

// Função para verificar se o usuário está em um horário de trabalho
export const isWithinWorkingHours = (
  currentTime: Date,
  workingHours: Array<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>
): boolean => {
  const dayOfWeek = currentTime.getDay();
  const currentTimeString = currentTime.toTimeString().slice(0, 5);
  
  const todayWorkingHours = workingHours.find(wh => 
    wh.day_of_week === dayOfWeek && wh.is_active
  );
  
  if (!todayWorkingHours) return false;
  
  return currentTimeString >= todayWorkingHours.start_time && 
         currentTimeString <= todayWorkingHours.end_time;
};

// Função para calcular tempo restante até o próximo horário disponível
export const getTimeUntilNextAvailable = (
  currentTime: Date,
  workingHours: Array<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>
): { hours: number; minutes: number } | null => {
  const dayOfWeek = currentTime.getDay();
  const currentTimeString = currentTime.toTimeString().slice(0, 5);
  
  // Procurar próximo dia com horário de trabalho
  for (let i = 0; i < 7; i++) {
    const checkDay = (dayOfWeek + i) % 7;
    const workingHour = workingHours.find(wh => 
      wh.day_of_week === checkDay && wh.is_active
    );
    
    if (workingHour) {
      if (i === 0 && currentTimeString < workingHour.start_time) {
        // Hoje, mas antes do horário de início
        const [startHour, startMinute] = workingHour.start_time.split(':').map(Number);
        const [currentHour, currentMinute] = currentTimeString.split(':').map(Number);
        
        const totalMinutes = (startHour * 60 + startMinute) - (currentHour * 60 + currentMinute);
        return {
          hours: Math.floor(totalMinutes / 60),
          minutes: totalMinutes % 60
        };
      } else if (i > 0) {
        // Próximo dia
        return {
          hours: 24 - currentTime.getHours() + (i - 1) * 24,
          minutes: 60 - currentTime.getMinutes()
        };
      }
    }
  }
  
  return null;
}; 