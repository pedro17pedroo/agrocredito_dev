import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Sprout, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { formatKwanza, parseKwanza } from "../lib/angola-utils";
import { useAuth } from "../hooks/use-auth";
import FinancialInstitutionSelector from "../components/credit/financial-institution-selector";
import DocumentManager from "../components/DocumentManager";
import { useCreditApplications } from "../contexts/CreditApplicationContext";

const applicationSchema = z.object({
  projectName: z.string().min(3, "Nome do projeto deve ter pelo menos 3 caracteres"),
  projectType: z.enum(["corn", "cassava", "cattle", "poultry", "horticulture", "other"]),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  amount: z.string().min(1, "Montante é obrigatório"),
  term: z.string().min(1, "Prazo é obrigatório"),
  // Project details
  productivity: z.enum(["small", "medium", "large"], { 
    required_error: "Seleccione o nível de produtividade" 
  }),
  agricultureType: z.string().min(3, "Tipo de agricultura deve ter pelo menos 3 caracteres"),
  creditDeliveryMethod: z.enum(["total", "monthly"], {
    required_error: "Seleccione a forma de disponibilidade do crédito"
  }),
  creditGuaranteeDeclaration: z.string().min(20, "Declaração da garantia deve ter pelo menos 20 caracteres"),
  // Financial information
  monthlyIncome: z.string().min(1, "Rendimento mensal atual é obrigatório"),
  expectedProjectIncome: z.string().min(1, "Rendimento esperado do projeto é obrigatório"),
  monthlyExpenses: z.string().min(1, "Despesas mensais são obrigatórias"),
  otherDebts: z.string().optional(),
  familyMembers: z.string().min(1, "Número de membros da família é obrigatório"),
  experienceYears: z.string().min(1, "Anos de experiência são obrigatórios"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

interface CreditProgram {
  id: string;
  name: string;
  description: string;
  projectTypes: string[];
  minAmount: string;
  maxAmount: string;
  minTerm: number;
  maxTerm: number;
  interestRate: string;
  effortRate: string;
  processingFee: string;
  financialInstitutionId: string;
}

export default function CreditApplication() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addApplication } = useCreditApplications();
  
  // Financial institution and program selection
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedProgramData, setSelectedProgramData] = useState<CreditProgram | undefined>();
  
  // Document management
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<any[]>([]);

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      projectName: "",
      projectType: "corn",
      description: "",
      amount: "",
      term: "12", // Keep as string for form compatibility
      productivity: "small",
      agricultureType: "",
      creditDeliveryMethod: "total",
      creditGuaranteeDeclaration: "",
    },
  });

  const createApplication = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      // Validate that at least some documents are selected
      if (selectedDocuments.length === 0) {
        throw new Error('Selecione pelo menos um documento para a aplicação');
      }

      // Create the credit application
      const payload = {
        projectName: data.projectName,
        projectType: data.projectType,
        description: data.description,
        amount: parseKwanza(data.amount).toString(),
        term: Number(data.term),
        productivity: data.productivity,
        agricultureType: data.agricultureType,
        creditDeliveryMethod: data.creditDeliveryMethod,
        creditGuaranteeDeclaration: data.creditGuaranteeDeclaration,
        // Financial information
        monthlyIncome: parseKwanza(data.monthlyIncome).toString(),
        expectedProjectIncome: parseKwanza(data.expectedProjectIncome).toString(),
        monthlyExpenses: parseKwanza(data.monthlyExpenses).toString(),
        otherDebts: data.otherDebts ? parseKwanza(data.otherDebts).toString() : '0',
        familyMembers: Number(data.familyMembers),
        experienceYears: Number(data.experienceYears),
        documentIds: selectedDocuments, // Send selected document IDs
        ...(selectedProgram && { creditProgramId: selectedProgram }),
      };
      
      // Temporary debug logs
      console.log('🔍 Frontend - Selected Documents:', selectedDocuments);
      console.log('🔍 Frontend - Payload being sent:', payload);
      
      const response = await fetch("/api/credit-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao enviar solicitação");
      }
      
      return await response.json();
    },
    onSuccess: (newApplication) => {
      // Adicionar a nova aplicação ao contexto reativo
      addApplication(newApplication);
      
      toast({
        title: "Solicitação enviada com sucesso!",
        description: "A sua solicitação será analisada em breve.",
      });
      
      // Invalidar queries para garantir sincronização
      queryClient.invalidateQueries({ queryKey: ["/api/credit-applications/user"] });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationForm) => {
    createApplication.mutate(data);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue) {
      const formatted = formatKwanza(parseInt(numericValue));
      form.setValue('amount', formatted);
    } else {
      form.setValue('amount', '');
    }
  };

  const handleInstitutionChange = (institutionId: string) => {
    setSelectedInstitution(institutionId);
    setSelectedProgram("");
    setSelectedProgramData(undefined);
  };

  const handleProgramChange = (programId: string, program?: CreditProgram) => {
    setSelectedProgram(programId);
    setSelectedProgramData(program);
    
    // Update form values based on selected program
    if (program) {
      const amount = parseKwanza(form.getValues('amount'));
      const minAmount = parseInt(program.minAmount);
      const maxAmount = parseInt(program.maxAmount);
      
      // Ensure amount is within program limits
      if (amount < minAmount) {
        form.setValue('amount', formatKwanza(minAmount));
      } else if (amount > maxAmount) {
        form.setValue('amount', formatKwanza(maxAmount));
      }
      
      // Ensure term is within program limits
      const term = parseInt(form.getValues('term'));
      if (term < program.minTerm) {
        form.setValue('term', program.minTerm.toString());
      } else if (term > program.maxTerm) {
        form.setValue('term', program.maxTerm.toString());
      }
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-agri-dark">Nova Solicitação de Crédito</h1>
            <p className="text-gray-600">Preencha os dados do seu projeto agrícola</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Financial Institution and Program Selection */}
          <FinancialInstitutionSelector
            selectedInstitution={selectedInstitution}
            onInstitutionChange={handleInstitutionChange}
            selectedProgram={selectedProgram}
            onProgramChange={handleProgramChange}
            projectType={form.watch('projectType')}
          />

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-agri-dark">
                <Sprout className="w-6 h-6 mr-2" />
                Detalhes do Projeto Agrícola
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Nome do Projeto</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="ex: Cultivo de Milho - Malanje"
                            className="form-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Tipo de Projeto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="corn">Cultivo de Milho</SelectItem>
                            <SelectItem value="cassava">Cultivo de Mandioca</SelectItem>
                            <SelectItem value="cattle">Criação de Gado</SelectItem>
                            <SelectItem value="poultry">Avicultura</SelectItem>
                            <SelectItem value="horticulture">Horticultura</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label">Descrição do Projeto</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva detalhadamente o seu projeto agrícola, objetivos e como pretende usar o crédito..."
                          className="min-h-[120px] form-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="productivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Produtividade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">Pequeno Produtor</SelectItem>
                            <SelectItem value="medium">Médio Produtor</SelectItem>
                            <SelectItem value="large">Grande Produtor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agricultureType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Tipo de Agricultura</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="ex: Horticultura, Pecuária, Agricultura Familiar..."
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
                  name="creditDeliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label">Forma de Disponibilidade do Crédito</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Selecione a forma de entrega" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="total">Entrega Total</SelectItem>
                          <SelectItem value="monthly">Por Prestação Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditGuaranteeDeclaration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label">Declaração da Garantia do Crédito</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Declare qual a garantia que irá oferecer à instituição financeira para a concessão do crédito (ex: hipoteca de terreno, penhor de equipamentos, aval de terceiros, etc.)..."
                          className="min-h-[100px] form-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Montante Pretendido</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="AOA 5,000,000"
                            className="form-input text-center font-semibold"
                            onChange={(e) => handleAmountChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Prazo (meses)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Selecione o prazo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="12">12 meses</SelectItem>
                            <SelectItem value="24">24 meses</SelectItem>
                            <SelectItem value="36">36 meses</SelectItem>
                            <SelectItem value="48">48 meses</SelectItem>
                            <SelectItem value="60">60 meses</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Financial Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-agri-dark">
                <FileText className="w-6 h-6 mr-2" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Rendimento Mensal Atual</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder="AOA 150,000"
                              className="form-input"
                              onChange={(e) => {
                                const formatted = formatKwanza(parseKwanza(e.target.value));
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectedProjectIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Rendimento Esperado do Projeto</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder="AOA 300,000"
                              className="form-input"
                              onChange={(e) => {
                                const formatted = formatKwanza(parseKwanza(e.target.value));
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="monthlyExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Despesas Mensais</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder="AOA 80,000"
                              className="form-input"
                              onChange={(e) => {
                                const formatted = formatKwanza(parseKwanza(e.target.value));
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="otherDebts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Outras Dívidas (Opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder="AOA 0"
                              className="form-input"
                              onChange={(e) => {
                                const formatted = formatKwanza(parseKwanza(e.target.value));
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="familyMembers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Número de Membros da Família</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              type="number"
                              placeholder="4"
                              className="form-input"
                              min="1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experienceYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Anos de Experiência na Agricultura</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              type="number"
                              placeholder="5"
                              className="form-input"
                              min="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Financial Summary */}
                  {form.watch('monthlyIncome') && form.watch('expectedProjectIncome') && form.watch('monthlyExpenses') && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Resumo Financeiro</h4>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 dark:text-blue-300">Rendimento Total Esperado:</span>
                          <p className="font-medium text-blue-800 dark:text-blue-200">
                            {formatKwanza(
                              parseKwanza(form.watch('monthlyIncome') || '0') + 
                              parseKwanza(form.watch('expectedProjectIncome') || '0')
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-700 dark:text-blue-300">Rendimento Líquido:</span>
                          <p className="font-medium text-blue-800 dark:text-blue-200">
                            {formatKwanza(
                              parseKwanza(form.watch('monthlyIncome') || '0') + 
                              parseKwanza(form.watch('expectedProjectIncome') || '0') - 
                              parseKwanza(form.watch('monthlyExpenses') || '0') - 
                              parseKwanza(form.watch('otherDebts') || '0')
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-700 dark:text-blue-300">Capacidade de Pagamento:</span>
                          <p className="font-medium text-blue-800 dark:text-blue-200">
                            {(() => {
                              const totalIncome = parseKwanza(form.watch('monthlyIncome') || '0') + parseKwanza(form.watch('expectedProjectIncome') || '0');
                              const totalExpenses = parseKwanza(form.watch('monthlyExpenses') || '0') + parseKwanza(form.watch('otherDebts') || '0');
                              const netIncome = totalIncome - totalExpenses;
                              const maxPayment = netIncome * 0.3; // 30% da renda líquida
                              return formatKwanza(maxPayment);
                            })()} (30% da renda líquida)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Form>
            </CardContent>
          </Card>

          {/* Document Management Section */}
          {user && ['farmer', 'company', 'cooperative'].includes(user.userType) && (
            <DocumentManager
              onDocumentsSelected={setSelectedDocuments}
              selectedDocuments={selectedDocuments}
            />
          )}

          {/* Selected Documents Summary */}
          {selectedDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-agri-dark">
                  <FileText className="w-6 h-6 mr-2" />
                  Documentos Selecionados para a Solicitação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 font-medium mb-2">
                    {selectedDocuments.length} documento(s) selecionado(s)
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Estes documentos serão anexados à sua solicitação de crédito e enviados para análise da instituição financeira.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Message */}
          {selectedDocuments.length === 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                    ⚠️ Nenhum documento selecionado
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Selecione pelo menos um documento para enviar com a sua solicitação de crédito.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit/Cancel Buttons - Moved to the end */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={createApplication.isPending || selectedDocuments.length === 0}
                  onClick={form.handleSubmit(onSubmit)}
                  className="flex-1 bg-agri-primary hover:bg-agri-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  title={selectedDocuments.length === 0 ? "Selecione pelo menos um documento para continuar" : ""}
                >
                  {createApplication.isPending ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
