import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  userType: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    enabled: !!localStorage.getItem("auth_token"),
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return null;
      }
      
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        return response.json();
      } catch (error: any) {
        if (error.message.includes("401")) {
          localStorage.removeItem("auth_token");
          return null;
        }
        throw error;
      }
    },
  });

  return {
    user: error ? null : user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async ({ loginIdentifier, password }: { loginIdentifier: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", {
        loginIdentifier,
        password,
      });
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      // Store token
      localStorage.setItem("auth_token", data.token);
      
      // Update query cache
      queryClient.setQueryData(["/api/auth/me"], data.user);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${data.user.fullName}!`,
      });

      // Redirect based on user type
      if (data.user.userType === "admin") {
        setLocation("/admin-dashboard");
      } else if (data.user.userType === "financial_institution") {
        setLocation("/financial-dashboard");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      // Store token
      localStorage.setItem("auth_token", data.token);
      
      // Update query cache
      queryClient.setQueryData(["/api/auth/me"], data.user);
      
      toast({
        title: "Conta criada com sucesso",
        description: `Bem-vindo ao AgroCrédito, ${data.user.fullName}!`,
      });

      // Redirect based on user type
      if (data.user.userType === "admin") {
        setLocation("/admin-dashboard");
      } else if (data.user.userType === "financial_institution") {
        setLocation("/financial-dashboard");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no registo",
        description: error.message || "Erro ao criar conta",
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      // Remove token
      localStorage.removeItem("auth_token");
      
      // Clear query cache
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
    },
    onSuccess: () => {
      toast({
        title: "Logout realizado",
        description: "Até breve!",
      });
      
      // Redirect to home page
      setLocation("/");
    },
  });
}
