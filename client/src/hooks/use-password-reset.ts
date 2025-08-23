import { useState } from 'react'
import { useToast } from './use-toast';

interface RequestPasswordResetData {
  contact: string;
  deliveryMethod: string;
}

interface ValidateOTPData {
  tokenId: string;
  otp: string;
}

interface ResetPasswordData {
  tokenId: string;
  otp: string;
  newPassword: string;
}

interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const requestPasswordReset = async (data: RequestPasswordResetData): Promise<PasswordResetResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: data.contact,
          deliveryMethod: data.deliveryMethod
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao solicitar recuperação de senha');
      }

      toast({
        title: 'Código enviado',
        description: 'Verifique o seu email para o código de verificação.',
        variant: 'default',
      });

      return {
        success: true,
        message: result.message,
        data: { tokenId: result.tokenId },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const validateOTP = async (data: ValidateOTPData): Promise<PasswordResetResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/validate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: data.tokenId,
          otp: data.otp
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Código inválido ou expirado');
      }

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<PasswordResetResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: data.tokenId,
          otp: data.otp,
          newPassword: data.newPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao redefinir senha');
      }

      toast({
        title: 'Senha redefinida',
        description: 'A sua senha foi redefinida com sucesso. Pode agora fazer login.',
        variant: 'default',
      });

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestPasswordReset,
    validateOTP,
    resetPassword,
    isLoading,
  };
};