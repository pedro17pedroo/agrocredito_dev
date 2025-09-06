import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { formatKwanza, parseKwanza } from "../../lib/angola-utils";
import FinancialInstitutionSelector from "./financial-institution-selector";

const simulatorSchema = z.object({
  amount: z.string().min(1, "Montante é obrigatório"),
  term: z.string().min(1, "Prazo é obrigatório"),
  projectType: z.enum(["milho", "mandioca", "gado", "avicultura", "horticultura", "outro"]),
  monthlyIncome: z.string().min(1, "Rendimento mensal é obrigatório"),
});

type SimulatorForm = z.infer<typeof simulatorSchema>;

interface SimulationResult {
  prestacaoMensal: number;
  montanteTotal: number;
  taxaJuro: number;
  jurosTotal: number;
  rendimentoMensal: number;
  taxaEsforco: number;
  percentagemTaxaEsforco: number;
  taxaEsforcoViolada: boolean;
  prestacaoMensalMaxima: number;
}

interface CreditProgram {
  id: string;
  nome: string;
  descricao: string;
  tiposProjeto: string[];
  montanteMinimo: string;
  montanteMaximo: string;
  prazoMinimo: number;
  prazoMaximo: number;
  taxaJuro: string;
  taxaEsforco: string;
  taxaProcessamento: string;
  instituicaoFinanceiraId: string;
}

export default function SimulatorForm() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedProgramData, setSelectedProgramData] = useState<CreditProgram | undefined>();

  const form = useForm<SimulatorForm>({
    resolver: zodResolver(simulatorSchema),
    defaultValues: {
      amount: "AOA 5,000,000",
      term: "36",
      projectType: "outro", // Alterado para "outro" para mostrar todos os programas por padrão
      monthlyIncome: "",
    },
  });

  const simulate = useMutation({
    mutationFn: async (formData: SimulatorForm) => {
      const simulationData = {
        amount: parseKwanza(formData.amount),
        term: parseInt(formData.term),
        projectType: formData.projectType,
        monthlyIncome: parseKwanza(formData.monthlyIncome),
        creditProgramId: selectedProgram || undefined,
      };
      
      const response = await apiRequest("POST", "/api/simulate-credit", simulationData);
      const data = await response.json();
      // Mapear as propriedades do backend (em inglês) para o frontend (em português)
      return {
        prestacaoMensal: data.monthlyPayment,
        montanteTotal: data.totalAmount,
        taxaJuro: data.interestRate,
        jurosTotal: data.totalInterest,
        rendimentoMensal: data.monthlyIncome,
        taxaEsforco: data.effortRate,
        percentagemTaxaEsforco: data.effortRatePercentage,
        taxaEsforcoViolada: data.isEffortRateViolated,
        prestacaoMensalMaxima: data.maxMonthlyPayment
      } as SimulationResult;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: SimulatorForm) => {
    simulate.mutate(data);
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
    setResult(null);
  };

  const handleProgramChange = (programId: string, program?: CreditProgram) => {
    setSelectedProgram(programId);
    setSelectedProgramData(program);
    setResult(null);
    
    // Atualizar valores do formulário baseado no programa selecionado
    if (program) {
      const amount = parseKwanza(form.getValues('amount'));
      const minAmount = parseInt(program.montanteMinimo);
      const maxAmount = parseInt(program.montanteMaximo);
      
      // Garantir que o montante está dentro dos limites do programa
      if (amount < minAmount) {
        form.setValue('amount', formatKwanza(minAmount));
      } else if (amount > maxAmount) {
        form.setValue('amount', formatKwanza(maxAmount));
      }
      
      // Garantir que o prazo está dentro dos limites do programa
      const term = parseInt(form.getValues('term'));
      if (term < program.prazoMinimo) {
        form.setValue('term', program.prazoMinimo.toString());
      } else if (term > program.prazoMaximo) {
        form.setValue('term', program.prazoMaximo.toString());
      }
    }
  };

  return (
    <div className="space-y-6">
      <FinancialInstitutionSelector
        selectedInstitution={selectedInstitution}
        onInstitutionChange={handleInstitutionChange}
        selectedProgram={selectedProgram}
        onProgramChange={handleProgramChange}
        projectType={form.watch('projectType')}
      />
      
      <Card className="shadow-xl">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Tipo de Projecto Agrícola</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="form-input">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="milho">Cultivo de Milho</SelectItem>
                      <SelectItem value="mandioca">Cultivo de Mandioca</SelectItem>
                      <SelectItem value="gado">Criação de Gado</SelectItem>
                      <SelectItem value="avicultura">Avicultura</SelectItem>
                      <SelectItem value="horticultura">Horticultura</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Rendimento Mensal</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="form-input text-2xl font-bold"
                      placeholder="AOA 500,000"
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = value.replace(/[^0-9]/g, '');
                        if (numericValue) {
                          field.onChange(formatKwanza(parseInt(numericValue)));
                        } else {
                          field.onChange('');
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-600">
                    O seu rendimento mensal será usado para calcular a taxa de esforço máxima permitida
                  </p>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={simulate.isPending}
              className="w-full bg-agri-primary text-white hover:bg-agri-dark py-4 rounded-xl font-semibold text-xl transition-colors"
            >
              <Calculator className="w-5 h-5 mr-2" />
              {simulate.isPending ? "Calculando..." : "Calcular Simulação"}
            </Button>
          </form>
        </Form>
        
        {result && (
          <div className="mt-8 p-6 bg-agri-light rounded-xl border-l-4 border-agri-primary">
            <h3 className="text-xl font-bold text-agri-dark mb-4">Resultado da Simulação</h3>
            
            {/* Informações do Programa */}
            {selectedProgramData && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Programa:</strong> {selectedProgramData.nome} - 
                  <strong> Taxa aplicada:</strong> {selectedProgramData.taxaJuro}% a.a. - 
                  <strong> Taxa de esforço máx:</strong> {selectedProgramData.taxaEsforco}%
                </p>
              </div>
            )}
            
            {/* Aviso da Taxa de Esforço */}
            {result.taxaEsforcoViolada && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Aviso:</strong> A prestação calculada ({formatKwanza(result.prestacaoMensalMaxima + 1)}) excede a taxa de esforço máxima.
                  O valor foi ajustado para {formatKwanza(result.prestacaoMensalMaxima)} (máx. {result.taxaEsforco}% do rendimento).
                </p>
              </div>
            )}
            
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-agri-primary">
                  {formatKwanza(result.prestacaoMensal)}
                </div>
                <div className="text-sm text-gray-600">Prestação Mensal</div>
                <div className="text-xs text-gray-500 mt-1">
                  {result.percentagemTaxaEsforco.toFixed(1)}% do rendimento
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-agri-secondary">
                  {formatKwanza(result.montanteTotal)}
                </div>
                <div className="text-sm text-gray-600">Total a Pagar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {result.taxaJuro}% a.a.
                </div>
                <div className="text-sm text-gray-600">Taxa de Juro</div>
              </div>
            </div>
            
            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg text-gray-700">
                  <strong>Juros totais:</strong> {formatKwanza(result.jurosTotal)}
                </div>
              </div>
              <div>
                <div className="text-lg text-gray-700">
                  <strong>Rendimento declarado:</strong> {formatKwanza(result.rendimentoMensal)}
                </div>
              </div>
            </div>
            
            {/* Effort Rate Bar */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Taxa de Esforço Atual</span>
                <span>{result.percentagemTaxaEsforco.toFixed(1)}% / {result.taxaEsforco}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    result.percentagemTaxaEsforco > result.taxaEsforco 
                      ? 'bg-red-500' 
                      : result.percentagemTaxaEsforco > result.taxaEsforco * 0.8 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((result.percentagemTaxaEsforco / result.taxaEsforco) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
