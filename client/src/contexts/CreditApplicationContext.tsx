import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import type { CreditApplication } from '../../../shared/schema';

// Interface do contexto
interface CreditApplicationContextType {
  applications: CreditApplication[];
  loading: boolean;
  error: string | null;
  // Ações
  fetchApplications: () => Promise<void>;
  addApplication: (application: CreditApplication) => void;
  updateApplication: (id: string, updates: Partial<CreditApplication>) => void;
  removeApplication: (id: string) => void;
  clearError: () => void;
  refreshNotifications: () => void;
  // Filtros e busca
  filteredApplications: CreditApplication[];
  setStatusFilter: (status: string | null) => void;
  setSearchTerm: (term: string) => void;
  statusFilter: string | null;
  searchTerm: string;
}

// Criar o contexto
const CreditApplicationContext = createContext<CreditApplicationContextType | undefined>(undefined);

// Provider do contexto
export const CreditApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<CreditApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Buscar todas as solicitações
  const fetchApplications = useCallback(async () => {
    if (!user) {
      console.log("[CreditApplicationContext] No user found");
      return;
    }
    
    console.log("[CreditApplicationContext] Fetching applications for user:", {
      userType: user.userType,
      userId: user.id,
      fullName: user.fullName
    });
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = user.userType === "financial_institution" 
        ? "/api/credit-applications/financial-institution"
        : "/api/credit-applications/user";
      
      console.log("[CreditApplicationContext] Using endpoint:", endpoint);
      
      const token = localStorage.getItem('auth_token');
      console.log("[CreditApplicationContext] Token found:", !!token);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("[CreditApplicationContext] Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[CreditApplicationContext] Response error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Erro ao carregar solicitações: ${response.status}`);
      }

      const data = await response.json();
      console.log("[CreditApplicationContext] Raw data received:", data);
      
      // Handle different response structures
      if (user.userType === "financial_institution") {
        // Financial institution endpoint returns { new, underReview, historical }
        const allApplications = [
          ...(data.new || []),
          ...(data.underReview || []),
          ...(data.historical || [])
        ];
        console.log("[CreditApplicationContext] Processed applications for financial institution:", {
          newCount: data.new?.length || 0,
          underReviewCount: data.underReview?.length || 0,
          historicalCount: data.historical?.length || 0,
          totalCount: allApplications.length
        });
        setApplications(allApplications);
      } else {
        // Regular user endpoint returns array directly
        console.log("[CreditApplicationContext] Applications for regular user:", data?.length || 0);
        setApplications(data || []);
      }
    } catch (err) {
      console.error("[CreditApplicationContext] Error fetching applications:", err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Adicionar nova solicitação
  const addApplication = useCallback((application: CreditApplication) => {
    setApplications(prev => [application, ...prev]);
    
    // Invalidar cache de notificações para buscar novas notificações
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  }, [queryClient]);

  // Atualizar solicitação existente
  const updateApplication = useCallback((id: string, updates: Partial<CreditApplication>) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === id 
          ? { ...app, ...updates, updatedAt: new Date() } as CreditApplication
          : app
      )
    );
    
    // Invalidar cache de notificações para buscar novas notificações
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  }, [queryClient]);

  // Remover solicitação
  const removeApplication = useCallback((id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
    
    // Invalidar cache de notificações
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  }, [queryClient]);

  const refreshNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  }, [queryClient]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Aplicações filtradas
  const filteredApplications = React.useMemo(() => {
    let filtered = applications;

    // Filtrar por status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.projectName?.toLowerCase().includes(term) ||
        app.description?.toLowerCase().includes(term) ||
        app.amount?.toString().includes(term) ||
        app.agricultureType?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [applications, statusFilter, searchTerm]);

  // Buscar aplicações quando o usuário mudar
  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  const value: CreditApplicationContextType = {
    applications,
    loading,
    error,
    fetchApplications,
    addApplication,
    updateApplication,
    removeApplication,
    clearError,
    refreshNotifications,
    filteredApplications,
    setStatusFilter,
    setSearchTerm,
    statusFilter,
    searchTerm,
  };

  return (
    <CreditApplicationContext.Provider value={value}>
      {children}
    </CreditApplicationContext.Provider>
  );
};

// Hook para usar o contexto
export const useCreditApplications = () => {
  const context = useContext(CreditApplicationContext);
  if (context === undefined) {
    throw new Error('useCreditApplications deve ser usado dentro de um CreditApplicationProvider');
  }
  return context;
};

// Hook para usar apenas as ações do contexto
export const useCreditApplicationActions = () => {
  const { fetchApplications, addApplication, updateApplication, removeApplication, clearError, refreshNotifications } = useCreditApplications();
  return {
    fetchApplications,
    addApplication,
    updateApplication,
    removeApplication,
    clearError,
    refreshNotifications,
  };
};

export default CreditApplicationContext;