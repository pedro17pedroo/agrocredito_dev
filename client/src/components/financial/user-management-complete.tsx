import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { extractErrorMessage, formatErrorForDisplay } from "@/utils/errorHandler";
import { 
  Users, 
  UserPlus, 
  Search,
  Building2,
  Shield,
  Edit,
  UserX,
  Phone,
  Mail,
  Eye,
  Settings
} from "lucide-react";

// Esquemas de formulário
const esquemaUtilizadorInterno = z.object({
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  bi: z.string().min(6, "BI deve ter pelo menos 6 caracteres"),
  nif: z.string().optional(),
  telefone: z.string().regex(/^\+244\d{9}$/, "Formato: +244XXXXXXXXX"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  palavraPasse: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
  tipoUtilizador: z.literal("financial_institution"),
  perfilId: z.string().optional(),
});

type FormularioUtilizadorInterno = z.infer<typeof esquemaUtilizadorInterno>;

interface Utilizador {
  id: string;
  nomeCompleto: string;
  telefone: string;
  email?: string;
  tipoUtilizador: string;
  perfilId?: string;
  estaAtivo: boolean;
  criadoEm: string;
}

interface Perfil {
  id: string;
  nome: string;
  descricao?: string;
}

export default function UserManagementComplete() {
  const [mostrarDialogoCriar, setMostrarDialogoCriar] = useState(false);
  const [mostrarDialogoEditar, setMostrarDialogoEditar] = useState(false);
  const [utilizadorSelecionado, setUtilizadorSelecionado] = useState<Utilizador | null>(null);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const { toast } = useToast();

  const form = useForm<FormularioUtilizadorInterno>({
    resolver: zodResolver(esquemaUtilizadorInterno),
    defaultValues: {
      nomeCompleto: "",
      bi: "",
      nif: "",
      telefone: "+244",
      email: "",
      palavraPasse: "",
      tipoUtilizador: "financial_institution",
      perfilId: "none",
    },
  });

  // Consultas
  const { data: utilizadoresInternos = [], isLoading: carregandoInternos } = useQuery<Utilizador[]>({
    queryKey: ["/api/financial-users/internal"],
  });

  const { data: clientes = [], isLoading: carregandoClientes } = useQuery<Utilizador[]>({
    queryKey: ["/api/financial-users/clients"],
  });

  const { data: perfis = [] } = useQuery<Perfil[]>({
    queryKey: ["/api/financial-users/profiles"],
  });

  // Mutações
  const criarUtilizador = useMutation({
    mutationFn: async (data: FormularioUtilizadorInterno) => {
      return apiRequest("POST", "/api/financial-users/internal", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-users/internal"] });
      setMostrarDialogoCriar(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Utilizador criado com sucesso",
      });
    },
    onError: (error: any) => {
          const { message, details } = extractErrorMessage(error, "Erro ao criar utilizador");
          
          toast({
            title: "Erro ao criar utilizador",
            description: formatErrorForDisplay(message, details),
            variant: "destructive",
          });
        },
  });

  const atualizarUtilizador = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormularioUtilizadorInterno> }) => {
      return apiRequest("PATCH", `/api/financial-users/internal/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-users/internal"] });
      setMostrarDialogoEditar(false);
      setUtilizadorSelecionado(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Utilizador atualizado com sucesso",
      });
    },
    onError: (error: any) => {
          const { message } = extractErrorMessage(error, "Erro ao atualizar utilizador");
          
          toast({
            title: "Erro ao atualizar utilizador",
            description: message,
            variant: "destructive",
          });
        },
  });

  const desativarUtilizador = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/financial-users/internal/${id}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-users/internal"] });
      toast({
        title: "Sucesso",
        description: "Utilizador desativado com sucesso",
      });
    },
    onError: (error: any) => {
          const { message } = extractErrorMessage(error, "Erro ao desativar utilizador");
          
          toast({
            title: "Erro ao desativar utilizador",
            description: message,
            variant: "destructive",
          });
        },
  });

  const atribuirPerfil = useMutation({
    mutationFn: async ({ userId, profileId }: { userId: string; profileId: string }) => {
      return apiRequest("PATCH", `/api/financial-users/internal/${userId}/profile`, { profileId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-users/internal"] });
      toast({
        title: "Sucesso",
        description: "Perfil atribuído com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atribuir perfil",
        variant: "destructive",
      });
    },
  });

  const lidarComCriarUtilizador = () => {
    setMostrarDialogoCriar(true);
    form.reset();
  };

  const lidarComEditarUtilizador = (utilizador: Utilizador) => {
    setUtilizadorSelecionado(utilizador);
    form.reset({
      nomeCompleto: utilizador.nomeCompleto,
      bi: "", // Não preencher dados sensíveis
      nif: "",
      telefone: utilizador.telefone,
      email: utilizador.email || "",
      palavraPasse: "", // Não preencher palavra-passe
      tipoUtilizador: "financial_institution",
      perfilId: utilizador.perfilId || "none",
    });
    setMostrarDialogoEditar(true);
  };

  const aoSubmeter = (data: FormularioUtilizadorInterno) => {
    // Encontrar o perfil "Instituição Financeira"
    const perfilInstituicaoFinanceira = perfis.find(p => p.nome === "Instituição Financeira");
    
    if (utilizadorSelecionado) {
      // Não enviar palavra-passe se estiver vazia (sem alteração)
       const dadosAtualizacao: Partial<FormularioUtilizadorInterno> = { ...data };
       if (!dadosAtualizacao.palavraPasse) {
         delete (dadosAtualizacao as any).palavraPasse;
       }
      atualizarUtilizador.mutate({ id: utilizadorSelecionado.id, data: dadosAtualizacao });
    } else {
      // Para novos utilizadores, atribuir automaticamente o perfil de instituição financeira
      const dadosNovoUtilizador = {
        ...data,
        perfilId: perfilInstituicaoFinanceira?.id || data.perfilId
      };
      criarUtilizador.mutate(dadosNovoUtilizador);
    }
  };

  // Filtrar utilizadores baseado no termo de pesquisa
  const utilizadoresInternosFiltrados = utilizadoresInternos.filter(utilizador =>
    utilizador.nomeCompleto.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
    utilizador.telefone.includes(termoPesquisa) ||
    (utilizador.email && utilizador.email.toLowerCase().includes(termoPesquisa.toLowerCase()))
  );

  const clientesFiltrados = clientes.filter(utilizador =>
    utilizador.nomeCompleto.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
    utilizador.telefone.includes(termoPesquisa) ||
    (utilizador.email && utilizador.email.toLowerCase().includes(termoPesquisa.toLowerCase()))
  );

  const obterRotuloTipoUtilizador = (tipoUtilizador: string) => {
    const tipos: { [key: string]: string } = {
      farmer: "Agricultor",
      company: "Empresa",
      cooperative: "Cooperativa",
      financial_institution: "Inst. Financeira",
      admin: "Administrador",
    };
    return tipos[tipoUtilizador] || tipoUtilizador;
  };

  const obterNomePerfil = (perfilId?: string) => {
    if (!perfilId) return "Sem perfil";
    const perfil = perfis.find(p => p.id === perfilId);
    return perfil?.nome || "Perfil desconhecido";
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Utilizadores</h2>
          <p className="text-gray-600">Gerir equipa interna e visualizar clientes</p>
        </div>
        <Button onClick={lidarComCriarUtilizador} className="bg-agri-primary hover:bg-agri-dark">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Utilizador
        </Button>
      </div>

      {/* Pesquisa */}
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Pesquisar utilizadores..."
          value={termoPesquisa}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermoPesquisa(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Separadores */}
      <Tabs defaultValue="internal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="internal" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Equipa Interna ({utilizadoresInternosFiltrados.length})</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Clientes ({clientesFiltrados.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Equipa Interna */}
        <TabsContent value="internal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Utilizadores Internos</span>
              </CardTitle>
              <CardDescription>
                Membros da equipa com acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {carregandoInternos ? (
                <div className="text-center py-4">A carregar...</div>
              ) : utilizadoresInternosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum utilizador interno encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {utilizadoresInternosFiltrados.map((utilizador) => (
                      <TableRow key={utilizador.id}>
                        <TableCell className="font-medium">
                          {utilizador.nomeCompleto}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span className="text-sm">{utilizador.telefone}</span>
                            </div>
                            {utilizador.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span className="text-sm">{utilizador.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {obterRotuloTipoUtilizador(utilizador.tipoUtilizador)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {obterNomePerfil(utilizador.perfilId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={utilizador.estaAtivo ? "default" : "destructive"}
                          >
                            {utilizador.estaAtivo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => lidarComEditarUtilizador(utilizador)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {utilizador.estaAtivo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => desativarUtilizador.mutate(utilizador.id)}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clientes */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Clientes</span>
              </CardTitle>
              <CardDescription>
                Utilizadores registados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {carregandoClientes ? (
                <div className="text-center py-4">A carregar...</div>
              ) : clientesFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum cliente encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesFiltrados.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">
                          {cliente.nomeCompleto}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span className="text-sm">{cliente.telefone}</span>
                            </div>
                            {cliente.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span className="text-sm">{cliente.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {obterRotuloTipoUtilizador(cliente.tipoUtilizador)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={cliente.estaAtivo ? "default" : "destructive"}
                          >
                            {cliente.estaAtivo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {new Date(cliente.criadoEm).toLocaleDateString('pt-AO')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo Criar/Editar Utilizador */}
      <Dialog open={mostrarDialogoCriar || mostrarDialogoEditar} onOpenChange={(open: boolean) => {
        if (!open) {
          setMostrarDialogoCriar(false);
          setMostrarDialogoEditar(false);
          setUtilizadorSelecionado(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {utilizadorSelecionado ? "Editar Utilizador" : "Criar Utilizador"}
            </DialogTitle>
            <DialogDescription>
              {utilizadorSelecionado 
                ? "Atualizar informações do utilizador" 
                : "Adicionar novo membro à equipa"
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(aoSubmeter)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeCompleto">Nome Completo</Label>
                <Input
                  id="nomeCompleto"
                  {...form.register("nomeCompleto")}
                  placeholder="Nome completo"
                />
                {form.formState.errors.nomeCompleto && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.nomeCompleto.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bi">BI</Label>
                <Input
                  id="bi"
                  {...form.register("bi")}
                  placeholder="Número do BI"
                />
                {form.formState.errors.bi && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.bi.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...form.register("telefone")}
                  placeholder="+244XXXXXXXXX"
                />
                {form.formState.errors.telefone && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.telefone.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nif">NIF (Opcional)</Label>
                <Input
                  id="nif"
                  {...form.register("nif")}
                  placeholder="Número do NIF"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Opcional)</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="email@exemplo.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="palavraPasse">
                {utilizadorSelecionado ? "Nova Palavra-passe (deixar vazio para manter)" : "Palavra-passe"}
              </Label>
              <Input
                id="palavraPasse"
                type="password"
                {...form.register("palavraPasse")}
                placeholder="Palavra-passe"
              />
              {form.formState.errors.palavraPasse && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.palavraPasse.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perfilId">Perfil</Label>
              <Select 
                value={form.watch("perfilId")} 
                onValueChange={(value: string) => form.setValue("perfilId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem perfil</SelectItem>
                  {perfis.map((perfil) => (
                    <SelectItem key={perfil.id} value={perfil.id}>
                      {perfil.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMostrarDialogoCriar(false);
                  setMostrarDialogoEditar(false);
                  setUtilizadorSelecionado(null);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={criarUtilizador.isPending || atualizarUtilizador.isPending}
                className="bg-agri-primary hover:bg-agri-dark"
              >
                {criarUtilizador.isPending || atualizarUtilizador.isPending 
                  ? "A processar..." 
                  : utilizadorSelecionado ? "Atualizar" : "Criar"
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}