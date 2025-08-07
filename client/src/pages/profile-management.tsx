import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Edit2, Trash2, Shield, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { Profile, Permission, User } from "@shared/schema";

const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [dialogType, setDialogType] = useState<"create" | "edit" | null>(null);

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ["/api/permissions"],
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: profilePermissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/profiles", selectedProfile?.id, "permissions"],
    enabled: !!selectedProfile,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Perfil criado",
        description: "O perfil foi criado com sucesso.",
      });
      setDialogType(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProfileFormData> }) => {
      const response = await fetch(`/api/profiles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Perfil actualizado",
        description: "O perfil foi actualizado com sucesso.",
      });
      setDialogType(null);
      form.reset();
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/profiles/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Perfil eliminado",
        description: "O perfil foi eliminado com sucesso.",
      });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ profileId, permissionId, action }: { profileId: string; permissionId: string; action: "add" | "remove" }) => {
      if (action === "add") {
        const response = await fetch(`/api/profiles/${profileId}/permissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ permissionId }),
        });
        if (!response.ok) throw new Error("Failed to add permission");
        return response.json();
      } else {
        const response = await fetch(`/api/profiles/${profileId}/permissions/${permissionId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to remove permission");
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", selectedProfile?.id, "permissions"] });
      toast({
        title: "Permissões actualizadas",
        description: "As permissões do perfil foram actualizadas.",
      });
    },
  });

  const assignProfileMutation = useMutation({
    mutationFn: async ({ userId, profileId }: { userId: string; profileId: string }) => {
      const response = await fetch(`/api/users/${userId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ profileId }),
      });
      if (!response.ok) throw new Error("Failed to assign profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Perfil atribuído",
        description: "O perfil foi atribuído ao utilizador com sucesso.",
      });
    },
  });

  const handleCreateProfile = (data: ProfileFormData) => {
    createProfileMutation.mutate(data);
  };

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setDialogType("edit");
    form.reset({
      name: profile.name,
      description: profile.description || "",
      isActive: profile.isActive ?? true,
    });
  };

  const handleUpdateProfile = (data: ProfileFormData) => {
    if (selectedProfile) {
      updateProfileMutation.mutate({ id: selectedProfile.id, data });
    }
  };

  const handleDeleteProfile = (profile: Profile) => {
    if (profile.isSystem) {
      toast({
        title: "Ação não permitida",
        description: "Perfis do sistema não podem ser eliminados.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm(`Tem a certeza que deseja eliminar o perfil "${profile.name}"?`)) {
      deleteProfileMutation.mutate(profile.id);
    }
  };

  const handlePermissionToggle = (permission: Permission, isChecked: boolean) => {
    if (!selectedProfile) return;
    
    updatePermissionsMutation.mutate({
      profileId: selectedProfile.id,
      permissionId: permission.id,
      action: isChecked ? "add" : "remove",
    });
  };

  const isPermissionAssigned = (permission: Permission) => {
    return profilePermissions.some(p => p.id === permission.id);
  };

  const getPermissionsByModule = () => {
    const modules = permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
    
    return modules;
  };

  const isLoading = profilesLoading || permissionsLoading || usersLoading;

  if (!user || user.userType !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600">Apenas administradores podem aceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-agri-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestão de Perfis e Permissões</h1>
              <p className="text-agri-secondary">Configure o acesso ao sistema para diferentes tipos de utilizadores</p>
            </div>
            <Dialog open={dialogType === "create"} onOpenChange={(open) => !open && setDialogType(null)}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setDialogType("create")}
                  className="bg-agri-dark hover:bg-opacity-80"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Perfil
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Perfil</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleCreateProfile)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Perfil</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Ex: Gestor Regional"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Descreva as responsabilidades deste perfil..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={form.watch("isActive")}
                      onCheckedChange={(checked) => form.setValue("isActive", checked)}
                    />
                    <Label htmlFor="isActive">Perfil activo</Label>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogType(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProfileMutation.isPending}
                      className="bg-agri-primary hover:bg-agri-dark"
                    >
                      {createProfileMutation.isPending ? "A criar..." : "Criar Perfil"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-primary mx-auto mb-4"></div>
            <p className="text-gray-600">A carregar dados...</p>
          </div>
        ) : (
          <Tabs defaultValue="profiles" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profiles">Perfis</TabsTrigger>
              <TabsTrigger value="users">Utilizadores</TabsTrigger>
            </TabsList>

            <TabsContent value="profiles">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Profiles List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Perfis do Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedProfile?.id === profile.id
                              ? "border-agri-primary bg-agri-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedProfile(profile)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-agri-dark">{profile.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
                              <div className="flex items-center mt-2 space-x-2">
                                <Badge variant={profile.isActive ? "default" : "secondary"}>
                                  {profile.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                                {profile.isSystem && (
                                  <Badge variant="outline">Sistema</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProfile(profile);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              {!profile.isSystem && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProfile(profile);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Permissions Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Permissões
                      {selectedProfile && (
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          - {selectedProfile.name}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedProfile ? (
                      <div className="text-center py-8">
                        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">Selecione um perfil para gerir as suas permissões</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(getPermissionsByModule()).map(([module, modulePermissions]) => (
                          <div key={module}>
                            <h4 className="font-semibold text-agri-dark mb-3 capitalize">
                              {module === "applications" ? "Solicitações" :
                               module === "accounts" ? "Contas" :
                               module === "payments" ? "Pagamentos" :
                               module === "reports" ? "Relatórios" :
                               module === "admin" ? "Administração" :
                               module === "users" ? "Utilizadores" :
                               module === "notifications" ? "Notificações" : module}
                            </h4>
                            <div className="space-y-2">
                              {modulePermissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-3">
                                  <Checkbox
                                    id={permission.id}
                                    checked={isPermissionAssigned(permission)}
                                    onCheckedChange={(checked) => 
                                      handlePermissionToggle(permission, Boolean(checked))
                                    }
                                    disabled={updatePermissionsMutation.isPending}
                                  />
                                  <div className="flex-1">
                                    <Label htmlFor={permission.id} className="text-sm font-medium">
                                      {permission.description}
                                    </Label>
                                    <p className="text-xs text-gray-500">{permission.name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Atribuição de Perfis aos Utilizadores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{u.fullName}</h3>
                          <p className="text-sm text-gray-600">{u.email || u.phone}</p>
                          <Badge variant="outline" className="mt-1">
                            {u.userType}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            Perfil: {profiles.find(p => p.id === u.profileId)?.name || "Nenhum"}
                          </span>
                          <select
                            className="px-3 py-1 border rounded"
                            value={u.profileId || ""}
                            onChange={(e) => {
                              if (e.target.value) {
                                assignProfileMutation.mutate({
                                  userId: u.id,
                                  profileId: e.target.value,
                                });
                              }
                            }}
                          >
                            <option value="">Selecionar perfil</option>
                            {profiles.filter(p => p.isActive).map((profile) => (
                              <option key={profile.id} value={profile.id}>
                                {profile.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Edit Profile Dialog */}
        <Dialog open={dialogType === "edit"} onOpenChange={(open) => !open && setDialogType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome do Perfil</Label>
                <Input
                  id="edit-name"
                  {...form.register("name")}
                  placeholder="Ex: Gestor Regional"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  {...form.register("description")}
                  placeholder="Descreva as responsabilidades deste perfil..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
                <Label htmlFor="edit-isActive">Perfil activo</Label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogType(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-agri-primary hover:bg-agri-dark"
                >
                  {updateProfileMutation.isPending ? "A actualizar..." : "Actualizar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}