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

// Form schemas
const internalUserSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  bi: z.string().min(6, "BI deve ter pelo menos 6 caracteres"),
  nif: z.string().optional(),
  phone: z.string().regex(/^\+244\d{9}$/, "Formato: +244XXXXXXXXX"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
  userType: z.literal("financial_institution"),
  profileId: z.string().optional(),
});

type InternalUserForm = z.infer<typeof internalUserSchema>;

interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  userType: string;
  profileId?: string;
  isActive: boolean;
  createdAt: string;
}

interface Profile {
  id: string;
  name: string;
  description?: string;
}

export default function UserManagementComplete() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<InternalUserForm>({
    resolver: zodResolver(internalUserSchema),
    defaultValues: {
      fullName: "",
      bi: "",
      nif: "",
      phone: "+244",
      email: "",
      password: "",
      userType: "financial_institution",
      profileId: "none",
    },
  });

  // Queries
  const { data: internalUsers = [], isLoading: isLoadingInternal } = useQuery<User[]>({
    queryKey: ["/api/financial-users/internal"],
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery<User[]>({
    queryKey: ["/api/financial-users/clients"],
  });

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/financial-users/profiles"],
  });

  // Mutations
  const createUser = useMutation({
    mutationFn: async (data: InternalUserForm) => {
      return apiRequest("POST", "/api/financial-users/internal", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-users/internal"] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Utilizador criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar utilizador",
        variant: "destructive",
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InternalUserForm> }) => {
      return apiRequest("PATCH", `/api/financial-users/internal/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-users/internal"] });
      setShowEditDialog(false);
      setSelectedUser(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Utilizador atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar utilizador",
        variant: "destructive",
      });
    },
  });

  const deactivateUser = useMutation({
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
      toast({
        title: "Erro",
        description: error.message || "Erro ao desativar utilizador",
        variant: "destructive",
      });
    },
  });

  const assignProfile = useMutation({
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

  const handleCreateUser = () => {
    setShowCreateDialog(true);
    form.reset();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.reset({
      fullName: user.fullName,
      bi: "", // Don't prefill sensitive data
      nif: "",
      phone: user.phone,
      email: user.email || "",
      password: "", // Don't prefill password
      userType: "financial_institution",
      profileId: user.profileId || "none",
    });
    setShowEditDialog(true);
  };

  const onSubmit = (data: InternalUserForm) => {
    // Find the "Instituição Financeira" profile
    const financialInstitutionProfile = profiles.find(p => p.name === "Instituição Financeira");
    
    if (selectedUser) {
      // Don't send password if it's empty (meaning no change)
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }
      updateUser.mutate({ id: selectedUser.id, data: updateData });
    } else {
      // For new users, automatically assign financial institution profile
      const newUserData = {
        ...data,
        profileId: financialInstitutionProfile?.id || data.profileId
      };
      createUser.mutate(newUserData);
    }
  };

  // Filter users based on search term
  const filteredInternalUsers = internalUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredClients = clients.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getUserTypeLabel = (userType: string) => {
    const types: { [key: string]: string } = {
      farmer: "Agricultor",
      company: "Empresa",
      cooperative: "Cooperativa",
      financial_institution: "Inst. Financeira",
      admin: "Administrador",
    };
    return types[userType] || userType;
  };

  const getProfileName = (profileId?: string) => {
    if (!profileId) return "Sem perfil";
    const profile = profiles.find(p => p.id === profileId);
    return profile?.name || "Perfil desconhecido";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Utilizadores</h2>
          <p className="text-gray-600">Gerir equipa interna e visualizar clientes</p>
        </div>
        <Button onClick={handleCreateUser} className="bg-agri-primary hover:bg-agri-dark">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Utilizador
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Pesquisar utilizadores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="internal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Equipa Interna ({internalUsers.length})
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Clientes ({clients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal">
          <Card>
            <CardHeader>
              <CardTitle>Equipa Interna</CardTitle>
              <CardDescription>
                Membros da equipa desta instituição financeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingInternal ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
                    </TableRow>
                  ) : filteredInternalUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Nenhum utilizador encontrado</TableCell>
                    </TableRow>
                  ) : (
                    filteredInternalUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                            {user.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getProfileName(user.profileId)}</Badge>
                            <Select
                              value={user.profileId || "none"}
                              onValueChange={(profileId) => {
                                const actualProfileId = profileId === "none" ? "" : profileId;
                                assignProfile.mutate({ userId: user.id, profileId: actualProfileId });
                              }}
                            >
                              <SelectTrigger className="w-8 h-8 p-0">
                                <Settings className="w-4 h-4" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sem perfil</SelectItem>
                                {profiles.map((profile) => (
                                  <SelectItem key={profile.id} value={profile.id}>
                                    {profile.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {user.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deactivateUser.mutate(user.id)}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Agricultores, empresas e cooperativas registadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingClients ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
                    </TableRow>
                  ) : filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Nenhum cliente encontrado</TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.fullName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getUserTypeLabel(client.userType)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                            {client.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.isActive ? "default" : "secondary"}>
                            {client.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit User Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setSelectedUser(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Editar Utilizador" : "Criar Utilizador"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? "Atualize as informações do utilizador da equipa interna."
                : "Adicione um novo membro à equipa interna da instituição."
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  placeholder="Nome completo"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bi">BI</Label>
                <Input
                  id="bi"
                  {...form.register("bi")}
                  placeholder="Bilhete de Identidade"
                />
                {form.formState.errors.bi && (
                  <p className="text-sm text-red-500">{form.formState.errors.bi.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+244XXXXXXXXX"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nif">NIF (Opcional)</Label>
                <Input
                  id="nif"
                  {...form.register("nif")}
                  placeholder="Número de Identificação Fiscal"
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
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {selectedUser ? "Nova Palavra-passe (Opcional)" : "Palavra-passe"}
              </Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder={selectedUser ? "Deixe vazio para manter atual" : "Palavra-passe"}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            {selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="profileId">Perfil</Label>
                <Select 
                  value={form.watch("profileId") || "none"} 
                  onValueChange={(value) => {
                    const actualValue = value === "none" ? "" : value;
                    form.setValue("profileId", actualValue);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem perfil</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!selectedUser && (
              <div className="space-y-2">
                <Label>Perfil</Label>
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Instituição Financeira</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Perfil atribuído automaticamente para membros da equipa interna
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setShowEditDialog(false);
                  setSelectedUser(null);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createUser.isPending || updateUser.isPending}
                className="bg-agri-primary hover:bg-agri-dark"
              >
                {createUser.isPending || updateUser.isPending 
                  ? "Guardando..." 
                  : selectedUser ? "Atualizar" : "Criar"
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}