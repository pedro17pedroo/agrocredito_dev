/**
 * Utilitário para tratamento padronizado de erros no frontend
 */

export interface ErrorResponse {
  success: boolean;
  message: string;
  details?: string[];
  error?: string; // Apenas em desenvolvimento
}

export interface ApiError {
  message: string;
  status?: number;
  response?: {
    data?: ErrorResponse;
  };
}

/**
 * Extrai uma mensagem de erro amigável de diferentes tipos de erro
 * @param error - O erro recebido da API ou operação
 * @param defaultMessage - Mensagem padrão caso não seja possível extrair uma mensagem específica
 * @returns Objeto com mensagem principal e detalhes opcionais
 */
export function extractErrorMessage(
  error: any,
  defaultMessage: string = "Ocorreu um erro inesperado"
): { message: string; details?: string[] } {
  let errorMessage = defaultMessage;
  let errorDetails: string[] = [];

  try {
    // Caso 1: Erro com response.data (axios/fetch)
    if (error?.response?.data) {
      const errorData = error.response.data;
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.details && Array.isArray(errorData.details)) {
        errorDetails = errorData.details;
      }
      if (errorDetails.length > 0) {
        return { message: errorMessage, details: errorDetails };
      }
      return { message: errorMessage };
    }

    // Caso 2: Erro com message que contém JSON (TanStack Query)
    if (error?.message && typeof error.message === 'string') {
      // Tentar extrair JSON da mensagem de erro
      const jsonMatch = error.message.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          const errorData = JSON.parse(jsonMatch[0]);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.details && Array.isArray(errorData.details)) {
            errorDetails = errorData.details;
          }
          if (errorDetails.length > 0) {
            return { message: errorMessage, details: errorDetails };
          }
          return { message: errorMessage };
        } catch {
          // Se falhar ao parsear JSON, continuar com outras verificações
        }
      }

      // Tentar extrair da mensagem após ':'
      const colonIndex = error.message.indexOf(': ');
      if (colonIndex !== -1) {
        try {
          const jsonPart = error.message.substring(colonIndex + 2);
          const errorData = JSON.parse(jsonPart);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.details && Array.isArray(errorData.details)) {
            errorDetails = errorData.details;
          }
          if (errorDetails.length > 0) {
            return { message: errorMessage, details: errorDetails };
          }
          return { message: errorMessage };
        } catch {
          // Se falhar ao parsear, usar a mensagem original
          errorMessage = error.message;
        }
      } else {
        // Usar a mensagem diretamente
        errorMessage = error.message;
      }
    }

    // Caso 3: Erro simples com message
    if (error?.message) {
      errorMessage = error.message;
    }

    // Caso 4: String simples
    if (typeof error === 'string') {
      errorMessage = error;
    }

  } catch (parseError) {
    console.warn('Erro ao processar mensagem de erro:', parseError);
    errorMessage = error?.message || defaultMessage;
  }

  if (errorDetails.length > 0) {
    return { message: errorMessage, details: errorDetails };
  }
  return { message: errorMessage };
}

/**
 * Formata a mensagem de erro para exibição no toast
 * @param message - Mensagem principal
 * @param details - Detalhes opcionais do erro
 * @returns String formatada para exibição
 */
export function formatErrorForDisplay(message: string, details?: string[]): string {
  if (!details || details.length === 0) {
    return message;
  }

  return `${message}\n\n• ${details.join('\n• ')}`;
}

/**
 * Mapeia códigos de status HTTP para mensagens amigáveis
 * @param status - Código de status HTTP
 * @returns Mensagem amigável correspondente
 */
export function getStatusMessage(status: number): string {
  const statusMessages: Record<number, string> = {
    400: "Dados inválidos fornecidos",
    401: "Acesso não autorizado. Faça login novamente",
    403: "Acesso negado. Você não tem permissão para esta operação",
    404: "Recurso não encontrado",
    409: "Conflito de dados. O recurso já existe",
    422: "Dados fornecidos são inválidos",
    429: "Muitas tentativas. Tente novamente mais tarde",
    500: "Erro interno do servidor. Tente novamente mais tarde",
    502: "Serviço temporariamente indisponível",
    503: "Serviço em manutenção. Tente novamente mais tarde",
    504: "Tempo limite excedido. Tente novamente"
  };

  return statusMessages[status] || "Ocorreu um erro inesperado";
}