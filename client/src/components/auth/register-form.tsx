import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "@/hooks/use-auth";
import { formatAngolaPhone, validateAngolaPhone, validateBI } from "@/lib/angola-utils";

const registerSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  bi: z.string().refine(validateBI, "BI inválido. Formato: 000000000LA000"),
  phone: z.string().refine(validateAngolaPhone, "Número de telefone angolano inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  userType: z.enum(["farmer", "company", "financial_institution"]),
  acceptTerms: z.boolean().refine((val) => val === true, "Deve aceitar os termos"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Palavras-passe não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const register = useRegister();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      bi: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "farmer",
      acceptTerms: false,
    },
  });

  const onSubmit = (data: RegisterForm) => {
    const { confirmPassword, acceptTerms, ...submitData } = data;
    
    // Remove empty email if not provided
    if (!submitData.email) {
      delete submitData.email;
    }
    
    register.mutate(submitData, {
      onSuccess,
    });
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatAngolaPhone(value);
    form.setValue('phone', formatted);
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <Sprout className="text-agri-primary w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-agri-dark mb-2">Criar Conta AgroCrédito</h2>
        <p className="text-gray-600">Junte-se à comunidade agrícola digital de Angola</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Tipo de Utilizador</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="farmer">Agricultor Familiar</SelectItem>
                    <SelectItem value="company">Empresa Agrícola</SelectItem>
                    <SelectItem value="financial_institution">Instituição Financeira</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Nome Completo</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="João Manuel Silva"
                      className="form-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Bilhete de Identidade</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="004589632LA041"
                      className="form-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Telemóvel</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="+244 923 456 789"
                    className="form-input"
                    onChange={(e) => handlePhoneChange(e.target.value)}
                  />
                </FormControl>
                <p className="text-sm text-gray-500">Formato: +244 9XX XXX XXX</p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Email (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="joao@exemplo.com"
                    className="form-input"
                  />
                </FormControl>
                <p className="text-sm text-gray-500">Se não tiver email, pode usar apenas o telemóvel</p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Palavra-passe</FormLabel>
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
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
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
          </div>
          
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-gray-700">
                    Aceito os <button type="button" className="text-agri-primary hover:underline">Termos de Serviço</button> e <button type="button" className="text-agri-primary hover:underline">Política de Privacidade</button> do AgroCrédito
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            disabled={register.isPending}
            className="w-full bg-agri-primary text-white hover:bg-agri-dark py-4 rounded-xl font-semibold text-xl transition-colors"
          >
            {register.isPending ? "Criando conta..." : "Criar Conta"}
          </Button>
          
          <div className="text-center text-gray-600">
            Já tem conta? 
            <button 
              type="button" 
              onClick={onSwitchToLogin}
              className="text-agri-primary hover:underline font-semibold ml-1"
            >
              Entrar aqui
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
