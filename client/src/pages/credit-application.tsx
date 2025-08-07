import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Sprout, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatKwanza, parseKwanza } from "@/lib/angola-utils";
import { useAuth } from "@/hooks/use-auth";
import FinancialInstitutionSelector from "@/components/credit/financial-institution-selector";
import DocumentUpload from "@/components/credit/document-upload";

const applicationSchema = z.object({
  projectName: z.string().min(3, "Nome do projeto deve ter pelo menos 3 caracteres"),
  projectType: z.enum(["corn", "cassava", "cattle", "poultry", "horticulture", "other"]),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  amount: z.string().min(1, "Montante é obrigatório"),
  term: z.string().min(1, "Prazo é obrigatório"),
  // New fields
  productivity: z.enum(["small", "medium", "large"], { 
    required_error: "Seleccione o nível de produtividade" 
  }),
  agricultureType: z.string().min(3, "Tipo de agricultura deve ter pelo menos 3 caracteres"),
  creditDeliveryMethod: z.enum(["total", "monthly"], {
    required_error: "Seleccione a forma de disponibilidade do crédito"
  }),
  creditGuaranteeDeclaration: z.string().min(20, "Declaração da garantia deve ter pelo menos 20 caracteres"),
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
  
  // Financial institution and program selection
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedProgramData, setSelectedProgramData] = useState<CreditProgram | undefined>();
  
  // Document uploads
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({});

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
      // Validate required documents
      if (user && ['farmer', 'company', 'cooperative'].includes(user.userType)) {
        const userType = user.userType as 'farmer' | 'company' | 'cooperative';
        const requiredDocs = getRequiredDocuments(userType).filter(doc => doc.required);
        const missingDocs = requiredDocs.filter(doc => !documents[doc.id]);
        
        if (missingDocs.length > 0) {
          throw new Error(`Documentos obrigatórios em falta: ${missingDocs.map(d => d.name).join(', ')}`);
        }
      }

      // For now, send JSON data (file upload will be handled separately)
      const payload = {
        projectName: data.projectName,
        projectType: data.projectType,
        description: data.description,
        amount: parseKwanza(data.amount).toString(),
        term: Number(data.term), // Ensure term is a number
        productivity: data.productivity,
        agricultureType: data.agricultureType,
        creditDeliveryMethod: data.creditDeliveryMethod,
        creditGuaranteeDeclaration: data.creditGuaranteeDeclaration,
        ...(selectedProgram && { creditProgramId: selectedProgram }),
      };
      
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
    onSuccess: () => {
      toast({
        title: "Solicitação enviada com sucesso!",
        description: "A sua solicitação será analisada em breve.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-applications"] });
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

  const handleDocumentChange = (documentId: string, file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [documentId]: file
    }));
  };

  const getRequiredDocuments = (userType: 'farmer' | 'company' | 'cooperative') => {
    const requirements = {
      farmer: [
        { id: "bi", name: "Bilhete de Identidade (BI)", required: true },
        { id: "soba_declaration", name: "Declaração do Soba", required: true },
        { id: "municipal_declaration", name: "Declaração da Administração Municipal", required: true },
        { id: "agricultural_proof", name: "Comprovativo da Actividade Agrícola", required: true },
        { id: "residence_certificate", name: "Atestado de Residência", required: false },
      ],
      company: [
        { id: "bi", name: "Bilhete de Identidade (BI)", required: true },
        { id: "company_document", name: "Documento da Empresa", required: true },
        { id: "agricultural_proof", name: "Comprovativo da Actividade Agrícola", required: true },
        { id: "business_plan", name: "Plano de Negócio", required: true },
        { id: "residence_proof", name: "Comprovativo de Residência", required: true },
        { id: "nif", name: "NIF", required: true },
        { id: "commercial_license", name: "Alvará Comercial", required: true },
        { id: "bank_statement", name: "Extrato Bancário", required: true },
      ],
      cooperative: [
        { id: "bi", name: "Bilhete de Identidade (BI)", required: true },
        { id: "company_document", name: "Documento da Cooperativa", required: true },
        { id: "agricultural_proof", name: "Comprovativo da Actividade Agrícola", required: true },
        { id: "business_plan", name: "Plano de Negócio", required: true },
        { id: "residence_proof", name: "Comprovativo de Residência", required: true },
        { id: "nif", name: "NIF", required: true },
        { id: "commercial_license", name: "Alvará Comercial", required: true },
        { id: "bank_statement", name: "Extrato Bancário", required: true },
      ],
    };
    return requirements[userType] || [];
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

          {/* Document Upload Section */}
          {user && ['farmer', 'company', 'cooperative'].includes(user.userType) && (
            <DocumentUpload
              userType={user.userType as 'farmer' | 'company' | 'cooperative'}
              documents={documents}
              onDocumentChange={handleDocumentChange}
            />
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
                  disabled={createApplication.isPending}
                  onClick={form.handleSubmit(onSubmit)}
                  className="flex-1 bg-agri-primary hover:bg-agri-dark"
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
