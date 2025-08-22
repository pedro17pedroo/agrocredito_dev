import { z } from "zod";

/**
 * Formata erros de validação Zod para mensagens amigáveis ao utilizador
 * Remove códigos de erro técnicos e fornece mensagens claras em português
 */
export function formatValidationErrors(error: z.ZodError): { message: string; details: string[] } {
  const fieldMessages: { [key: string]: string } = {
    fullName: "Nome completo",
    bi: "Bilhete de Identidade",
    nif: "NIF",
    phone: "Número de telefone",
    email: "Email",
    password: "Palavra-passe",
    userType: "Tipo de utilizador",
    profileId: "Perfil"
  };

  const details = error.errors.map(err => {
    const fieldName = fieldMessages[err.path[0] as string] || err.path.join('.');
    
    switch (err.code) {
      case 'invalid_type':
        if (err.expected === 'string' && err.received === 'undefined') {
          return `${fieldName} é obrigatório`;
        }
        return `${fieldName} deve ser do tipo ${err.expected}`;
      
      case 'too_small':
        if (err.type === 'string') {
          return `${fieldName} deve ter pelo menos ${err.minimum} caracteres`;
        }
        return `${fieldName} deve ter pelo menos ${err.minimum}`;
      
      case 'too_big':
        if (err.type === 'string') {
          return `${fieldName} não pode ter mais de ${err.maximum} caracteres`;
        }
        return `${fieldName} não pode ser maior que ${err.maximum}`;
      
      case 'invalid_string':
        if (err.validation === 'email') {
          return `${fieldName} deve ter um formato válido (exemplo: nome@email.com)`;
        }
        if (err.validation === 'regex') {
          if (err.path[0] === 'phone') {
            return `${fieldName} deve seguir o formato angolano (+244XXXXXXXXX)`;
          }
          if (err.path[0] === 'bi') {
            return `${fieldName} deve seguir o formato angolano (000000000LA000)`;
          }
        }
        return `${fieldName} tem formato inválido`;
      
      case 'invalid_enum_value':
        return `${fieldName} deve ser um dos valores permitidos: ${err.options.join(', ')}`;
      
      case 'custom':
        return err.message;
      
      default:
        return `${fieldName}: ${err.message}`;
    }
  });

  return {
    message: "Por favor, corrija os seguintes campos:",
    details
  };
}

/**
 * Formata erros de duplicação de dados para mensagens amigáveis
 */
export function formatDuplicationError(field: string, value?: string | null): string {
  const fieldMessages: { [key: string]: string } = {
    phone: "número de telefone",
    email: "endereço de email",
    bi: "Bilhete de Identidade",
    nif: "NIF"
  };

  const fieldName = fieldMessages[field] || field;
  
  if (value && value.trim() !== '') {
    return `Já existe um utilizador registado com este ${fieldName} (${value}). Por favor, verifique os dados ou contacte o administrador.`;
  }
  
  return `Já existe um utilizador registado com este ${fieldName}. Por favor, verifique os dados ou contacte o administrador.`;
}

/**
 * Formata erros gerais do sistema para mensagens amigáveis
 */
export function formatSystemError(error: Error): string {
  // Log do erro técnico para debugging
  console.error('System error:', error);
  
  // Retorna mensagem amigável para o utilizador
  if (error.message.includes('duplicate') || error.message.includes('unique')) {
    return "Este utilizador já existe no sistema. Por favor, verifique os dados inseridos.";
  }
  
  if (error.message.includes('connection') || error.message.includes('timeout')) {
    return "Erro de conexão com o servidor. Por favor, tente novamente em alguns instantes.";
  }
  
  if (error.message.includes('permission') || error.message.includes('access')) {
    return "Não tem permissão para realizar esta operação. Contacte o administrador.";
  }
  
  return "Ocorreu um erro inesperado. Por favor, tente novamente ou contacte o suporte técnico.";
}

/**
 * Interface para resposta de erro padronizada
 */
export interface ErrorResponse {
  success: false;
  message: string;
  details?: string[];
  timestamp: string;
}

/**
 * Cria uma resposta de erro padronizada
 */
export function createErrorResponse(message: string, details?: string[]): ErrorResponse {
  return {
    success: false,
    message,
    details: details || undefined,
    timestamp: new Date().toISOString()
  };
}