import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, Eye, EyeOff, ArrowLeft, Mail, Smartphone } from "lucide-react";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { usePasswordReset } from "../../hooks/use-password-reset";
import { apiRequest } from "../../lib/queryClient";

// Schemas para cada etapa
const requestOtpSchema = z.object({
  contact: z.string().email("Email inválido"),
  deliveryMethod: z.literal("email"),
});

const validateOtpSchema = z.object({
  otp: z.string().min(1, "Código é obrigatório").max(6, "Código deve ter no máximo 6 dígitos"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type RequestOtpForm = z.infer<typeof requestOtpSchema>;
type ValidateOtpForm = z.infer<typeof validateOtpSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

type Step = "request" | "validate" | "reset";

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onSuccess, onBackToLogin }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>("request");
  const [tokenId, setTokenId] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const { toast } = useToast();
  const { requestPasswordReset, validateOTP, resetPassword, isLoading } = usePasswordReset();

  // Formulário para solicitar OTP
  const requestForm = useForm<RequestOtpForm>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: {
      contact: "",
      deliveryMethod: "email",
    },
  });

  // Formulário para validar OTP
  const validateForm = useForm<ValidateOtpForm>({
    resolver: zodResolver(validateOtpSchema),
    defaultValues: {
      otp: "",
    },
  });



  // Formulário para redefinir senha
  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onRequestOtp = async (data: RequestOtpForm) => {
    const result = await requestPasswordReset({ 
      contact: data.contact,
      deliveryMethod: data.deliveryMethod
    });
    if (result.success) {
      setContact(data.contact);
      setTokenId(result.data?.tokenId || "");
      // Resetar o formulário de validação para garantir que o campo OTP esteja limpo
      validateForm.reset({ otp: "" });
      setStep("validate");
    }
  };

  const onValidateOtp = async (data: ValidateOtpForm) => {
    const result = await validateOTP({ 
      tokenId: tokenId, 
      otp: data.otp 
    });
    if (result.success) {
      setOtp(data.otp);
      setStep("reset");
      toast({
        title: "Código validado",
        description: "Agora pode definir a sua nova senha.",
      });
    }
  };

  const onResetPassword = async (data: ResetPasswordForm) => {
    const result = await resetPassword({
      tokenId: tokenId,
      otp: otp,
      newPassword: data.newPassword
    });
    
    if (result.success) {
      // Redirecionar para login após sucesso
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  const renderRequestStep = () => (
    <div className="p-8">
      <div className="text-center mb-8">
        <Sprout className="text-agri-primary w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-agri-dark mb-2">Recuperar Palavra-passe</h2>
        <p className="text-gray-600">Introduza o seu email para receber um código de verificação</p>
      </div>
      
      <Form {...requestForm}>
        <form onSubmit={requestForm.handleSubmit(onRequestOtp)} className="space-y-6">
          <FormField
            control={requestForm.control}
            name="contact"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="form-label">Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="exemplo@email.com"
                    className="form-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
            <Label className="form-label">Método de entrega</Label>
            <RadioGroup
              value={contactMethod}
              onValueChange={(value: string) => setContactMethod(value as 'email' | 'phone')}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                <RadioGroupItem value="email" id="email" />
                <Mail className="w-5 h-5 text-agri-primary" />
                <Label htmlFor="email" className="flex-1 cursor-pointer">
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-500">Receber código por email</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50 opacity-50">
                <RadioGroupItem value="phone" id="phone" disabled />
                <Smartphone className="w-5 h-5 text-gray-400" />
                <Label htmlFor="phone" className="flex-1 cursor-not-allowed">
                  <div className="font-medium text-gray-400">SMS</div>
                  <div className="text-sm text-gray-400">Indisponível no momento</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-agri-primary text-white hover:bg-agri-dark py-4 rounded-xl font-semibold text-xl transition-colors"
          >
            {isLoading ? "Enviando..." : "Enviar Código"}
          </Button>
          
          <div className="text-center">
            <button 
              type="button" 
              onClick={onBackToLogin}
              className="text-agri-primary hover:underline font-medium flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao login
            </button>
          </div>
        </form>
      </Form>
    </div>
  );

  const renderValidateStep = () => (
    <div className="p-8">
      <div className="text-center mb-8">
        <Sprout className="text-agri-primary w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-agri-dark mb-2">Verificar Código</h2>
        <p className="text-gray-600">Introduza o código de 6 dígitos enviado para</p>
        <p className="text-agri-primary font-medium">{contact}</p>
      </div>
      
      <Form {...validateForm}>
        <form onSubmit={validateForm.handleSubmit(onValidateOtp)} className="space-y-6">
          <div className="space-y-2">
            <label className="form-label">Código de Verificação</label>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="000000"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm form-input text-center text-2xl tracking-widest"
              maxLength={6}
              autoComplete="one-time-code"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus
              value={validateForm.watch('otp') || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                validateForm.setValue('otp', value);
              }}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-agri-primary text-white hover:bg-agri-dark py-4 rounded-xl font-semibold text-xl transition-colors"
          >
            {isLoading ? "Verificando..." : "Verificar Código"}
          </Button>
          
          <div className="text-center space-y-2">
            <button 
              type="button" 
              onClick={() => {
                validateForm.reset({ otp: "" });
                setStep("request");
              }}
              className="text-agri-primary hover:underline font-medium flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
            
            <div className="text-sm text-gray-500">
              Não recebeu o código? 
              <button 
                type="button" 
                onClick={() => {
                  validateForm.reset({ otp: "" });
                  setStep("request");
                }}
                className="text-agri-primary hover:underline font-medium ml-1"
              >
                Reenviar
              </button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );

  const renderResetStep = () => (
    <div className="p-8">
      <div className="text-center mb-8">
        <Sprout className="text-agri-primary w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-agri-dark mb-2">Nova Palavra-passe</h2>
        <p className="text-gray-600">Defina a sua nova palavra-passe</p>
      </div>
      
      <Form {...resetForm}>
        <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-6">
          <FormField
            control={resetForm.control}
            name="newPassword"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="form-label">Nova Palavra-passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={resetForm.control}
            name="confirmPassword"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="form-label">Confirmar Palavra-passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-agri-primary text-white hover:bg-agri-dark py-4 rounded-xl font-semibold text-xl transition-colors"
          >
            {isLoading ? "Redefinindo..." : "Redefinir Palavra-passe"}
          </Button>
        </form>
      </Form>
    </div>
  );

  switch (step) {
    case "request":
      return renderRequestStep();
    case "validate":
      return renderValidateStep();
    case "reset":
      return renderResetStep();
    default:
      return renderRequestStep();
  }
}