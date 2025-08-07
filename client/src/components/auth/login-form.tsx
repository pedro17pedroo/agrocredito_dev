import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";

const loginSchema = z.object({
  loginIdentifier: z.string().min(1, "Email ou telefone é obrigatório"),
  password: z.string().min(1, "Palavra-passe é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginIdentifier: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess,
    });
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <Sprout className="text-agri-primary w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-agri-dark mb-2">Entrar no AgroCrédito</h2>
        <p className="text-gray-600">Aceda à sua conta para gerir os seus créditos</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="loginIdentifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Email ou Telemóvel</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="exemplo@email.com ou +244 923 456 789"
                    className="form-input"
                  />
                </FormControl>
                <p className="text-sm text-gray-500">
                  Pode usar o seu email ou número de telemóvel angolano
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
          
          <Button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-agri-primary text-white hover:bg-agri-dark py-4 rounded-xl font-semibold text-xl transition-colors"
          >
            {login.isPending ? "Entrando..." : "Entrar"}
          </Button>
          
          <div className="text-center">
            <button type="button" className="text-agri-primary hover:underline font-medium">
              Esqueceu a palavra-passe?
            </button>
          </div>
          
          <div className="text-center text-gray-600">
            Ainda não tem conta? 
            <button 
              type="button" 
              onClick={onSwitchToRegister}
              className="text-agri-primary hover:underline font-semibold ml-1"
            >
              Registar agora
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
