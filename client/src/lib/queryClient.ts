import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Tratamento específico para erros 403 (Forbidden)
    if (res.status === 403) {
      console.warn('Erro 403 - Acesso negado:', text);
      throw new Error(`Acesso negado: ${text}`);
    }
    
    // Tratamento específico para erros 401 (Unauthorized)
    if (res.status === 401) {
      console.warn('Erro 401 - Token inválido ou expirado');
      
      // Verificar se é um erro de login (credenciais inválidas) ou sessão expirada
      let errorMessage;
      try {
        const errorData = JSON.parse(text);
        // Se a mensagem do servidor contém "Credenciais inválidas", usar essa mensagem
        if (errorData.message && errorData.message.includes('Credenciais inválidas')) {
          errorMessage = errorData.message;
        } else {
          // Para outros casos 401, assumir que é sessão expirada
          localStorage.removeItem('auth_token');
          errorMessage = 'Sessão expirada. Faça login novamente.';
        }
      } catch {
        // Se não conseguir fazer parse do JSON, assumir sessão expirada
        localStorage.removeItem('auth_token');
        errorMessage = 'Sessão expirada. Faça login novamente.';
      }
      
      throw new Error(errorMessage);
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Criar AbortController com timeout de 30 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : null,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Requisição cancelada por timeout (30s)');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      retryOnMount: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
      // Aumentar timeout para evitar cancelamento de requisições
      networkMode: 'always',
      // Adicionar configuração para evitar múltiplas requisições
      gcTime: 0, // Não manter cache de mutations
    },
  },
});
