import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { formatKwanza } from "@/lib/angola-utils";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Settings,
  Percent,
  Calendar,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CreditProgram {
  id: string;
  financialInstitutionId: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const projectTypeOptions = [
  { value: "corn", label: "Milho" },
  { value: "cassava", label: "Mandioca" },
  { value: "cattle", label: "Pecuária" },
  { value: "poultry", label: "Avicultura" },
  { value: "horticulture", label: "Horticultura" },
  { value: "other", label: "Outro" }
];

const programSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  projectTypes: z.array(z.string()).min(1, "Selecione pelo menos um tipo de projeto"),
  minAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor mínimo inválido"),
  maxAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor máximo inválido"),
  minTerm: z.number().min(1, "Prazo mínimo deve ser pelo menos 1 mês"),
  maxTerm: z.number().min(1, "Prazo máximo deve ser pelo menos 1 mês"),
  interestRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de juros inválida"),
  effortRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de esforço inválida"),
  processingFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Taxa de processamento inválida").optional(),
}).refine((data) => parseFloat(data.minAmount) < parseFloat(data.maxAmount), {
  message: "Valor mínimo deve ser menor que o máximo",
  path: ["maxAmount"],
}).refine((data) => data.minTerm < data.maxTerm, {
  message: "Prazo mínimo deve ser menor que o máximo",
  path: ["maxTerm"],
});

type ProgramForm = z.infer<typeof programSchema>;

export default function CreditProgramManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProgram, setSelectedProgram] = useState<CreditProgram | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const form = useForm<ProgramForm>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      description: "",
      projectTypes: [],
      minAmount: "",
      maxAmount: "",
      minTerm: 6,
      maxTerm: 60,
      interestRate: "",
      effortRate: "",
      processingFee: "0",
    },
  });

  // Query for credit programs
  const { data: programs = [], isLoading } = useQuery<CreditProgram[]>({
    queryKey: ["/api/credit-programs"],
  });

  // Create program mutation
  const createProgram = useMutation({
    mutationFn: async (data: ProgramForm) => {
      return apiRequest("POST", "/api/credit-programs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-programs"] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Programa de crédito criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar programa de crédito",
        variant: "destructive",
      });
    },
  });

  // Update program mutation
  const updateProgram = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProgramForm }) => {
      return apiRequest("PUT", `/api/credit-programs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-programs"] });
      setShowEditDialog(false);
      setSelectedProgram(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Programa de crédito atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar programa de crédito",
        variant: "destructive",
      });
    },
  });

  // Delete program mutation
  const deleteProgram = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/credit-programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-programs"] });
      toast({
        title: "Sucesso",
        description: "Programa de crédito eliminado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar programa de crédito",
        variant: "destructive",
      });
    },
  });

  // Toggle active status mutation
  const toggleActiveStatus = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/credit-programs/${id}/toggle-status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-programs"] });
      toast({
        title: "Sucesso",
        description: "Estado do programa atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar estado do programa",
        variant: "destructive",
      });
    },
  });

  const handleCreateProgram = () => {
    setShowCreateDialog(true);
    form.reset();
  };

  const handleEditProgram = (program: CreditProgram) => {
    setSelectedProgram(program);
    form.reset({
      name: program.name,
      description: program.description || "",
      projectTypes: program.projectTypes,
      minAmount: program.minAmount,
      maxAmount: program.maxAmount,
      minTerm: program.minTerm,
      maxTerm: program.maxTerm,
      interestRate: program.interestRate,
      effortRate: program.effortRate,
      processingFee: program.processingFee || "0",
    });
    setShowEditDialog(true);
  };

  const handleViewProgram = (program: CreditProgram) => {
    setSelectedProgram(program);
    setShowViewDialog(true);
  };

  const onSubmit = (data: ProgramForm) => {
    if (selectedProgram) {
      updateProgram.mutate({ id: selectedProgram.id, data });
    } else {
      createProgram.mutate(data);
    }
  };

  const getProjectTypeLabels = (types: string[]) => {
    return types.map(type => 
      projectTypeOptions.find(opt => opt.value === type)?.label || type
    ).join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg">A carregar programas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Programas de Crédito</h2>
          <p className="text-gray-600">Crie e gira os seus programas de crédito</p>
        </div>
        <Button onClick={handleCreateProgram} className="bg-agri-primary hover:bg-agri-dark">
          <Plus className="w-4 h-4 mr-2" />
          Novo Programa
        </Button>
      </div>

      {/* Programs List */}
      <div className="grid gap-6">
        {programs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum programa criado
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Crie o seu primeiro programa de crédito para começar a oferecer financiamento aos agricultores.
              </p>
              <Button onClick={handleCreateProgram} className="bg-agri-primary hover:bg-agri-dark">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Programa
              </Button>
            </CardContent>
          </Card>
        ) : (
          programs.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{program.name}</CardTitle>
                      <Badge className={program.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {program.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {program.description && (
                      <CardDescription className="text-base">
                        {program.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProgram(program)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProgram(program)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActiveStatus.mutate(program.id)}
                      disabled={toggleActiveStatus.isPending}
                    >
                      {program.isActive ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProgram.mutate(program.id)}
                      disabled={deleteProgram.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-agri-primary" />
                      <span className="font-medium">Valores</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Mínimo: {formatKwanza(parseFloat(program.minAmount))}</p>
                      <p>Máximo: {formatKwanza(parseFloat(program.maxAmount))}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-agri-primary" />
                      <span className="font-medium">Prazos</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Mínimo: {program.minTerm} meses</p>
                      <p>Máximo: {program.maxTerm} meses</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-agri-primary" />
                      <span className="font-medium">Taxas</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Juros: {program.interestRate}%</p>
                      <p>Esforço: {program.effortRate}%</p>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <span className="font-medium text-sm">Tipos de Projeto: </span>
                  <span className="text-sm text-gray-600">
                    {getProjectTypeLabels(program.projectTypes)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setSelectedProgram(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProgram ? "Editar Programa de Crédito" : "Criar Novo Programa de Crédito"}
            </DialogTitle>
            <DialogDescription>
              Configure as condições e parâmetros do programa de crédito
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Programa</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Crédito Agrícola Básico" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descrição do programa..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="projectTypes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tipos de Projeto Suportados</FormLabel>
                      <div className="grid md:grid-cols-3 gap-4 mt-2">
                        {projectTypeOptions.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="projectTypes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={option.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="minAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Mínimo (AOA)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="100000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Máximo (AOA)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="5000000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="minTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo Mínimo (meses)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="6"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo Máximo (meses)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="60"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Juros Anual (%)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="15.5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="effortRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Esforço Máxima (%)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="processingFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Processamento (%)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setShowEditDialog(false);
                    setSelectedProgram(null);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createProgram.isPending || updateProgram.isPending}
                >
                  {selectedProgram ? "Atualizar" : "Criar"} Programa
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Programa de Crédito</DialogTitle>
          </DialogHeader>
          
          {selectedProgram && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Informações Gerais</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {selectedProgram.name}</p>
                    {selectedProgram.description && (
                      <p><strong>Descrição:</strong> {selectedProgram.description}</p>
                    )}
                    <p><strong>Estado:</strong> 
                      <Badge className={selectedProgram.isActive ? "bg-green-100 text-green-800 ml-2" : "bg-red-100 text-red-800 ml-2"}>
                        {selectedProgram.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Valores e Prazos</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Valor Mínimo:</strong> {formatKwanza(parseFloat(selectedProgram.minAmount))}</p>
                    <p><strong>Valor Máximo:</strong> {formatKwanza(parseFloat(selectedProgram.maxAmount))}</p>
                    <p><strong>Prazo Mínimo:</strong> {selectedProgram.minTerm} meses</p>
                    <p><strong>Prazo Máximo:</strong> {selectedProgram.maxTerm} meses</p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Taxas</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Taxa de Juros:</strong> {selectedProgram.interestRate}% ao ano</p>
                    <p><strong>Taxa de Esforço:</strong> {selectedProgram.effortRate}% máximo</p>
                    <p><strong>Taxa de Processamento:</strong> {selectedProgram.processingFee}%</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Tipos de Projeto</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.projectTypes.map((type) => (
                      <Badge key={type} variant="outline">
                        {projectTypeOptions.find(opt => opt.value === type)?.label || type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}