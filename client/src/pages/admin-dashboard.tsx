import React, { useState, useMemo } from "react";
import { useAuth, useLogout } from "../hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sprout, LogOut, Users, FileText, TrendingUp, CheckCircle, XCircle, Eye, 
  Settings, UserPlus, Shield, BarChart3, CreditCard, Building2, Tractor,
  Menu, X, Home, DollarSign, Edit, Trash2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import LoginForm from "../components/auth/login-form";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { usePermissions } from "../hooks/use-permissions";
import { PermissionGate } from "../components/PermissionGate";
import { apiRequest } from "../lib/queryClient";
import { formatKwanza, getProjectTypeLabel, getStatusLabel } from "../lib/angola-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CreditApplication, User, Profile, Permission } from "@shared/schema";

type AdminSection = 'dashboard' | 'users' | 'applications' | 'reports' | 'profiles' | 'permissions';

export default function AdminDashboard() {
  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const { user } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  // State hooks
  const [selectedApplication, setSelectedApplication] = useState<CreditApplication | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    bi: '',
    nif: '',
    phone: '',
    email: '',
    userType: '',
    profileId: ''
  });

  // User management state
  const [userFilters, setUserFilters] = useState({
    search: '',
    userType: 'all',
    isActive: 'all',
    page: 1,
    itemsPerPage: 10
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // User CRUD states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [loadingActions, setLoadingActions] = useState<{[key: string]: boolean}>({});
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Application filters state
  const [applicationFilters, setApplicationFilters] = useState({
    status: 'all',
    projectType: 'all',
    minAmount: '',
    search: ''
  });

  // Query hooks - all must be called before any early returns
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ["/api/admin/credit-applications"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  // Handle different response formats based on user type
  const allApplications = Array.isArray(applicationsData) 
    ? applicationsData 
    : (applicationsData as any)
      ? [...((applicationsData as any).new || []), ...((applicationsData as any).underReview || []), ...((applicationsData as any).historical || [])]
      : [];

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/admin/profiles"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/admin/permissions"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  // Filtered applications based on filters
  const filteredApplications = useMemo(() => {
    return allApplications.filter((application: any) => {
      // Filter by status
      if (applicationFilters.status !== 'all' && application.status !== applicationFilters.status) {
        return false;
      }

      // Filter by project type
      if (applicationFilters.projectType !== 'all' && application.projectType !== applicationFilters.projectType) {
        return false;
      }

      // Filter by minimum amount
      if (applicationFilters.minAmount && parseFloat(application.amount) < parseFloat(applicationFilters.minAmount)) {
        return false;
      }

      // Filter by search term (project name, user name, user email)
      if (applicationFilters.search) {
        const searchTerm = applicationFilters.search.toLowerCase();
        const projectName = application.projectName?.toLowerCase() || '';
        const userName = application.user?.fullName?.toLowerCase() || '';
        const userEmail = application.user?.email?.toLowerCase() || '';
        
        if (!projectName.includes(searchTerm) && 
            !userName.includes(searchTerm) && 
            !userEmail.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [allApplications, applicationFilters]);



  // Mutation hooks - also must be called before early returns
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/credit-applications/${id}/status`, {
        status,
        rejectionReason
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Estado atualizado com sucesso",
        description: "A solicitação foi processada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedApplication(null);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar estado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilizador criado com sucesso",
        description: "O novo utilizador foi adicionado ao sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowCreateUserDialog(false);
      setNewUser({
        fullName: '',
        bi: '',
        nif: '',
        phone: '',
        email: '',
        userType: '',
        profileId: ''
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar utilizador",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<User> }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilizador atualizado com sucesso",
        description: "As informações do utilizador foram atualizadas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowEditUserDialog(false);
      setEditingUser({});
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar utilizador",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle user status mutation
  const toggleUserStatus = useMutation<any, Error, { id: string; isActive: boolean }>({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Marcar como loading
      setLoadingActions(prev => ({ ...prev, [`toggle-${id}`]: true }));
      
      const response = await apiRequest("PATCH", `/api/admin/users/${id}/status`, { isActive });
      return response.json();
    },
    onSuccess: (_: any, { id, isActive }: { id: string; isActive: boolean }) => {
      toast({
        title: `Utilizador ${isActive ? 'ativado' : 'desativado'} com sucesso`,
        description: `O utilizador foi ${isActive ? 'ativado' : 'desativado'} no sistema.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      // Remover loading
      setLoadingActions(prev => ({ ...prev, [`toggle-${id}`]: false }));
    },
    onError: (error: Error, { id }: { id: string }) => {
      toast({
        title: "Erro ao alterar estado do utilizador",
        description: error.message,
        variant: "destructive",
      });
      // Remover loading
      setLoadingActions(prev => ({ ...prev, [`toggle-${id}`]: false }));
    },
    // Adicionar configuração para evitar múltiplas requisições
    retry: false,
    gcTime: 0,
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      // Marcar como loading
      setLoadingActions(prev => ({ ...prev, [`delete-${id}`]: true }));
      
      const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return response.json();
    },
    onSuccess: (_: any, id: string) => {
      toast({
        title: "Utilizador eliminado com sucesso",
        description: "O utilizador foi removido do sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowDeleteConfirmDialog(false);
      setUserToDelete(null);
      // Remover loading
      setLoadingActions(prev => ({ ...prev, [`delete-${id}`]: false }));
    },
    onError: (error: Error, id: string) => {
      toast({
        title: "Erro ao eliminar utilizador",
        description: error.message,
        variant: "destructive",
      });
      setShowDeleteConfirmDialog(false);
      setUserToDelete(null);
      // Remover loading
      setLoadingActions(prev => ({ ...prev, [`delete-${id}`]: false }));
    },
    // Adicionar configuração para evitar múltiplas requisições
    retry: false,
    gcTime: 0,
  });

  // NOW we can do early returns after ALL hooks are defined
  
  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border">
            <LoginForm 
              onSuccess={() => {
                // Redirection is handled automatically in useLogin hook
              }}
              onSwitchToRegister={() => {
                // Not needed for admin login
              }}
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Painel Administrativo - AgroCrédito</p>
            <p className="mt-1">Para teste: admin@agricredit.ao / admin123</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has admin permissions
  if (user.userType !== "admin" && user.userType !== "financial_institution") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Não tem permissões para aceder a esta página.</p>
          <Button 
            onClick={() => logout.mutate()}
            variant="outline" 
            className="mt-4"
          >
            Fazer Login com Outra Conta
          </Button>
        </div>
      </div>
    );
  }

  const handleApprove = (application: CreditApplication) => {
    updateApplicationStatus.mutate({
      id: application.id,
      status: "approved"
    });
  };

  const handleReject = (application: CreditApplication) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, indique o motivo da rejeição.",
        variant: "destructive",
      });
      return;
    }
    
    updateApplicationStatus.mutate({
      id: application.id,
      status: "rejected",
      rejectionReason
    });
  };

  const handleLogout = () => {
    logout.mutate();
  };

  const pendingApplications = allApplications.filter(app => app.status === "pending");

  const allSidebarItems = [
    { id: 'dashboard', label: 'Painel Principal', icon: Home, permission: null },
    { id: 'users', label: hasPermission('users.create') ? 'Gestão de Utilizadores' : 'Utilizadores', icon: Users, permission: 'users.read' },
    { id: 'applications', label: 'Solicitações de Crédito', icon: FileText, permission: 'credit_applications.read' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, permission: 'reports.read' },
    { id: 'profiles', label: 'Perfis e Permissões', icon: Shield, permission: 'admin.read' },
  ];
  
  const sidebarItems = allSidebarItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-agri-dark text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-agri-primary">
        <div className="flex items-center">
          <Sprout className="w-8 h-8 mr-2" />
          <span className="text-lg font-bold">
            {user?.userType === 'admin' ? 'Admin AgroCrédito' : 'Instituição Financeira'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white hover:bg-agri-primary"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <nav className="mt-5 px-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 text-white ${
                activeSection === item.id 
                  ? "bg-agri-primary hover:bg-agri-primary/90" 
                  : "hover:bg-agri-primary/50"
              }`}
              onClick={() => setActiveSection(item.id as AdminSection)}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-2 right-2">
        <div className="bg-agri-primary/20 rounded-lg p-3 mb-3">
          <div className="text-sm font-medium">{user.fullName}</div>
          <div className="text-xs text-agri-light">{user.email}</div>
          <Badge variant="secondary" className="mt-1 bg-agri-secondary text-agri-dark">
            {user.userType === "admin" ? "Administrador" : 
             user.userType === "financial_institution" ? "Instituição Financeira" :
             "Utilizador"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          className="w-full text-white hover:bg-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Terminar Sessão
        </Button>
      </div>
    </div>
  );

  const renderCreateUserDialog = () => (
    <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Utilizador</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar um novo utilizador no sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              value={newUser.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Nome completo do utilizador"
            />
          </div>
          <div>
            <Label htmlFor="bi">Bilhete de Identidade</Label>
            <Input
              id="bi"
              value={newUser.bi}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, bi: e.target.value }))}
              placeholder="000000000LA000"
            />
          </div>
          <div>
            <Label htmlFor="nif">NIF (Opcional)</Label>
            <Input
              id="nif"
              value={newUser.nif}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, nif: e.target.value }))}
              placeholder="NIF do utilizador"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={newUser.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+244900000000"
            />
          </div>
          <div>
            <Label htmlFor="email">Email (Opcional)</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="userType">Tipo de Utilizador</Label>
            <Select value={newUser.userType} onValueChange={(value: string) => setNewUser(prev => ({ ...prev, userType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">Agricultor</SelectItem>
                <SelectItem value="company">Empresa Agrícola</SelectItem>
                <SelectItem value="cooperative">Cooperativa</SelectItem>
                <SelectItem value="financial_institution">Instituição Financeira</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="profileId">Perfil</Label>
            <Select value={newUser.profileId} onValueChange={(value: string) => setNewUser(prev => ({ ...prev, profileId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar perfil" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile: Profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} - {profile.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setShowCreateUserDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              if (!createUser.isPending) {
                createUser.mutate(newUser);
              }
            }}
            disabled={createUser.isPending || !newUser.fullName || !newUser.bi || !newUser.phone || !newUser.userType}
          >
            {createUser.isPending ? 'Criando...' : 'Criar Utilizador'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Renderiza o painel principal com estatísticas gerais
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Solicitações</p>
                <p className="text-2xl font-bold text-agri-dark">{allApplications.length}</p>
              </div>
              <FileText className="text-blue-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-agri-dark">{pendingApplications.length}</p>
              </div>
              <FileText className="text-yellow-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Aprovadas</p>
                <p className="text-2xl font-bold text-agri-dark">
                  {allApplications.filter(app => app.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="text-green-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejeitadas</p>
                <p className="text-2xl font-bold text-agri-dark">
                  {allApplications.filter(app => app.status === "rejected").length}
                </p>
              </div>
              <XCircle className="text-red-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Utilizadores</p>
                <p className="text-2xl font-bold text-agri-dark">{allUsers.length}</p>
              </div>
              <Users className="text-purple-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e estatísticas adicionais para o painel principal */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Solicitações este mês</span>
                <span className="font-semibold">{allApplications.filter(app => {
                  const appDate = new Date(app.createdAt || '');
                  const currentDate = new Date();
                  return appDate.getMonth() === currentDate.getMonth() && appDate.getFullYear() === currentDate.getFullYear();
                }).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor total solicitado</span>
                <span className="font-semibold">{formatKwanza(allApplications.reduce((sum, app) => sum + app.amount, 0))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de aprovação</span>
                <span className="font-semibold">
                  {allApplications.length > 0 
                    ? Math.round((allApplications.filter(app => app.status === 'approved').length / allApplications.length) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allApplications.slice(0, 3).map((app: CreditApplication) => (
                <div key={app.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{app.projectName}</p>
                    <p className="text-xs text-gray-500">{formatKwanza(app.amount)}</p>
                  </div>
                  <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {getStatusLabel(app.status || 'pending').label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Renderiza a seção específica de solicitações de crédito
  const renderApplicationsManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-agri-dark">Gestão de Solicitações de Crédito</h2>
      </div>

      {/* Filtros para solicitações */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={applicationFilters.status} onValueChange={(value) => setApplicationFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovada</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="project-type-filter">Tipo de Projeto</Label>
              <Select value={applicationFilters.projectType} onValueChange={(value) => setApplicationFilters(prev => ({ ...prev, projectType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="crops">Culturas</SelectItem>
                  <SelectItem value="livestock">Pecuária</SelectItem>
                  <SelectItem value="equipment">Equipamentos</SelectItem>
                  <SelectItem value="infrastructure">Infraestrutura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount-filter">Valor Mínimo</Label>
              <Input 
                type="number" 
                placeholder="0" 
                value={applicationFilters.minAmount}
                onChange={(e) => setApplicationFilters(prev => ({ ...prev, minAmount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="search-filter">Pesquisar</Label>
              <Input 
                placeholder="Nome do projeto, utilizador..." 
                value={applicationFilters.search}
                onChange={(e) => setApplicationFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista completa de solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">A carregar...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Utilizador</TableHead>
                  <TableHead>Montante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data de Submissão</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.projectName}</div>
                        <div className="text-sm text-gray-500">{getProjectTypeLabel(app.projectType)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{app.user?.fullName || `Utilizador #${app.userId}`}</div>
                        <div className="text-gray-500">{app.user?.email || `ID: ${app.userId}`}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatKwanza(app.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {getStatusLabel(app.status || 'pending').label}
                      </Badge>
                    </TableCell>
                    <TableCell>{app.createdAt ? format(new Date(app.createdAt), "dd/MM/yyyy HH:mm") : '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowApplicationDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700"
                              onClick={() => updateApplicationStatus.mutate({ id: app.id!, status: 'approved' })}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => updateApplicationStatus.mutate({ id: app.id!, status: 'rejected' })}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
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
    </div>
  );





  // Filter and sort users
  const filteredUsers = allUsers.filter((userData: User) => {
    const matchesSearch = userFilters.search === '' || 
      userData.fullName.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      userData.email?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      userData.phone.includes(userFilters.search) ||
      userData.bi.toLowerCase().includes(userFilters.search.toLowerCase());
    
    const matchesType = userFilters.userType === 'all' || userData.userType === userFilters.userType;
    const matchesActive = userFilters.isActive === 'all' || 
      (userFilters.isActive === 'active' ? (userData as any).isActive : !(userData as any).isActive);
    
    return matchesSearch && matchesType && matchesActive;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a: User, b: User) => {
    const aValue = (a as any)[sortConfig.key] || '';
    const bValue = (b as any)[sortConfig.key] || '';
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  // Paginate users
  const totalPages = Math.ceil(sortedUsers.length / userFilters.itemsPerPage);
  const startIndex = (userFilters.page - 1) * userFilters.itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + userFilters.itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderUsersManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{hasPermission('users.create') ? 'Gestão de Utilizadores' : 'Utilizadores'}</h2>
        <PermissionGate permission="users.create">
          <Button onClick={() => setShowCreateUserDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Criar Utilizador
          </Button>
        </PermissionGate>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Pesquisa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Pesquisar</Label>
              <Input
                id="search"
                placeholder="Nome, email, telefone ou BI..."
                value={userFilters.search}
                onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              />
            </div>
            <div>
              <Label htmlFor="userType">Tipo de Utilizador</Label>
              <Select value={userFilters.userType} onValueChange={(value: string) => setUserFilters(prev => ({ ...prev, userType: value, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="farmer">Agricultor</SelectItem>
                  <SelectItem value="company">Empresa Agrícola</SelectItem>
                  <SelectItem value="cooperative">Cooperativa</SelectItem>
                  <SelectItem value="financial_institution">Instituição Financeira</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="isActive">Estado</Label>
              <Select value={userFilters.isActive} onValueChange={(value: string) => setUserFilters(prev => ({ ...prev, isActive: value, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="itemsPerPage">Itens por Página</Label>
              <Select value={userFilters.itemsPerPage.toString()} onValueChange={(value: string) => setUserFilters(prev => ({ ...prev, itemsPerPage: parseInt(value), page: 1 }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {startIndex + 1}-{Math.min(startIndex + userFilters.itemsPerPage, sortedUsers.length)} de {sortedUsers.length} utilizadores
            </p>
            <Button
              variant="outline"
              onClick={() => setUserFilters({ search: '', userType: 'all', isActive: 'all', page: 1, itemsPerPage: 10 })}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('fullName')}
                >
                  Nome {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Email/Telefone</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('userType')}
                >
                  Tipo {sortConfig.key === 'userType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('isActive')}
                >
                  Estado {sortConfig.key === 'isActive' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('createdAt')}
                >
                  Data de Criação {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <PermissionGate anyPermissions={['users.update', 'users.delete']}>
                  <TableHead>Ações</TableHead>
                </PermissionGate>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((userData: User) => (
                <TableRow key={userData.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{userData.fullName}</div>
                      <div className="text-sm text-gray-500">BI: {userData.bi}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {userData.email && <div>{userData.email}</div>}
                      <div className="text-sm text-gray-500">{userData.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {userData.userType === 'farmer' ? 'Agricultor' :
                       userData.userType === 'company' ? 'Empresa' :
                       userData.userType === 'cooperative' ? 'Cooperativa' :
                       userData.userType === 'financial_institution' ? 'Inst. Financeira' :
                       'Administrador'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={(userData as any).isActive ? 'default' : 'secondary'}>
                      {(userData as any).isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {userData.createdAt ? format(new Date(userData.createdAt), "dd/MM/yyyy") : '-'}
                  </TableCell>
                  <PermissionGate anyPermissions={['users.update', 'users.delete']}>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userData);
                            setShowUserDetailsDialog(true);
                          }}
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <PermissionGate permission="users.update">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // Filtrar campos de timestamp para evitar conflitos
                              const { createdAt, updatedAt, ...editableData } = userData;
                              setEditingUser(editableData);
                              setShowEditUserDialog(true);
                            }}
                            title="Editar utilizador"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                        <PermissionGate permission="users.update">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              if (!toggleUserStatus.isPending && !loadingActions[`toggle-${userData.id}`]) {
                                toggleUserStatus.mutate({ 
                                  id: userData.id, 
                                  isActive: !(userData as any).isActive 
                                });
                              }
                            }}
                            disabled={toggleUserStatus.isPending || loadingActions[`toggle-${userData.id}`]}
                            title={(userData as any).isActive ? 'Desativar utilizador' : 'Ativar utilizador'}
                            className={(userData as any).isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {loadingActions[`toggle-${userData.id}`] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              (userData as any).isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                        </PermissionGate>
                        <PermissionGate permission="users.delete">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setUserToDelete(userData);
                              setShowDeleteConfirmDialog(true);
                            }}
                            title="Eliminar utilizador"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </PermissionGate>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={userFilters.page === 1}
                  onClick={() => setUserFilters(prev => ({ ...prev, page: 1 }))}
                >
                  Primeira
                </Button>
                <Button
                  variant="outline"
                  disabled={userFilters.page === 1}
                  onClick={() => setUserFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Anterior
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNumber = Math.max(1, userFilters.page - 2) + i;
                  if (pageNumber <= totalPages) {
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === userFilters.page ? "default" : "outline"}
                        onClick={() => setUserFilters(prev => ({ ...prev, page: pageNumber }))}
                      >
                        {pageNumber}
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={userFilters.page === totalPages}
                  onClick={() => setUserFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Próxima
                </Button>
                <Button
                  variant="outline"
                  disabled={userFilters.page === totalPages}
                  onClick={() => setUserFilters(prev => ({ ...prev, page: totalPages }))}
                >
                  Última
                </Button>
              </div>
            </div>
            <div className="mt-2 text-center text-sm text-gray-600">
              Página {userFilters.page} de {totalPages}
            </div>
          </CardContent>
        </Card>
      )}
      <PermissionGate permission="users.create">
        {renderCreateUserDialog()}
      </PermissionGate>
    </div>
  );

  const renderProfilesManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{hasPermission('admin.profiles') ? 'Gestão de Perfis e Permissões' : 'Perfis e Permissões'}</h2>
      
      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles">Perfis</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Perfis do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Sistema</TableHead>
                    <PermissionGate anyPermissions={['admin.profiles', 'admin.permissions']}>
                      <TableHead>Ações</TableHead>
                    </PermissionGate>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile: Profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name}</TableCell>
                      <TableCell>{profile.description}</TableCell>
                      <TableCell>
                        <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                          {profile.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile.isSystem && <Badge variant="outline">Sistema</Badge>}
                      </TableCell>
                      <PermissionGate anyPermissions={['admin.profiles', 'admin.permissions']}>
                        <TableCell>
                          <div className="flex space-x-2">
                            <PermissionGate permission="admin.profiles">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </PermissionGate>
                            {!profile.isSystem && (
                              <PermissionGate permission="admin.profiles">
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </PermissionGate>
                            )}
                          </div>
                        </TableCell>
                      </PermissionGate>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissões do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission: Permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.module}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{permission.action}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Componente para exibir detalhes da solicitação
  const renderApplicationDetailsDialog = () => (
    <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Solicitação de Crédito</DialogTitle>
          <DialogDescription>
            Informações completas sobre a solicitação selecionada
          </DialogDescription>
        </DialogHeader>
        
        {selectedApplication && (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Nome do Projeto</Label>
                <p className="text-sm bg-gray-50 p-2 rounded">{selectedApplication.projectName}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Tipo de Projeto</Label>
                <p className="text-sm bg-gray-50 p-2 rounded">{getProjectTypeLabel(selectedApplication.projectType)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Montante Solicitado</Label>
                <p className="text-sm bg-gray-50 p-2 rounded font-medium">{formatKwanza(selectedApplication.amount)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Estado</Label>
                <Badge variant={selectedApplication.status === 'approved' ? 'default' : selectedApplication.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {getStatusLabel(selectedApplication.status || 'pending').label}
                </Badge>
              </div>
            </div>

            {/* Descrição do Projeto */}
            {selectedApplication.description && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Descrição do Projeto</Label>
                <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{selectedApplication.description}</p>
              </div>
            )}

            {/* Informações Financeiras */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Montante Solicitado</Label>
                <p className="text-sm bg-gray-50 p-2 rounded">{formatKwanza(selectedApplication.amount)}</p>
              </div>
              {(selectedApplication as any).repaymentPeriod && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Período de Reembolso</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{(selectedApplication as any).repaymentPeriod} meses</p>
                </div>
              )}
              {(selectedApplication as any).interestRate && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Taxa de Juro</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{(selectedApplication as any).interestRate}%</p>
                </div>
              )}
            </div>

            {/* Informações de Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Data de Submissão</Label>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedApplication.createdAt ? format(new Date(selectedApplication.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                </p>
              </div>
              {selectedApplication.updatedAt && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Última Atualização</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {format(new Date(selectedApplication.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>

            {/* Motivo de Rejeição (se aplicável) */}
            {selectedApplication.status === 'rejected' && (selectedApplication as any).rejectionReason && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-700">Motivo da Rejeição</Label>
                <p className="text-sm bg-red-50 p-3 rounded border border-red-200">{(selectedApplication as any).rejectionReason}</p>
              </div>
            )}

            {/* Ações de Administrador */}
            {selectedApplication.status === 'pending' && (
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => {
                    updateApplicationStatus.mutate({
                      id: selectedApplication.id,
                      status: 'approved'
                    });
                    setShowApplicationDetails(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt('Motivo da rejeição:');
                    if (reason) {
                      updateApplicationStatus.mutate({
                        id: selectedApplication.id,
                        status: 'rejected',
                        rejectionReason: reason
                      });
                      setShowApplicationDetails(false);
                    }
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsersManagement();
      case 'applications':
        return renderApplicationsManagement();
      case 'reports':
        return renderDashboard(); // For now, show dashboard for reports
      case 'profiles':
        return renderProfilesManagement();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-xl font-semibold text-gray-900">
                {sidebarItems.find(item => item.id === activeSection)?.label || 'Painel Administrativo'}
              </h1>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Diálogo de Detalhes da Solicitação */}
      {renderApplicationDetailsDialog()}
      
      {/* Diálogos CRUD de Utilizadores */}
      {renderUserDetailsDialog()}
      {renderEditUserDialog()}
      {renderDeleteConfirmDialog()}
    </div>
  );

  // Diálogo de visualização de detalhes do utilizador
  function renderUserDetailsDialog() {
    if (!selectedUser) return null;

    return (
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Utilizador</DialogTitle>
            <DialogDescription>
              Informações completas do utilizador selecionado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Nome Completo</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedUser.fullName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Bilhete de Identidade</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedUser.bi}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">NIF</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedUser.nif || 'Não informado'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Telefone</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedUser.phone}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedUser.email || 'Não informado'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tipo de Utilizador</Label>
                  <Badge variant="outline">
                    {selectedUser.userType === 'farmer' ? 'Agricultor' :
                     selectedUser.userType === 'company' ? 'Empresa' :
                     selectedUser.userType === 'cooperative' ? 'Cooperativa' :
                     selectedUser.userType === 'financial_institution' ? 'Inst. Financeira' :
                     'Administrador'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Estado e Datas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Estado e Datas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Estado</Label>
                  <Badge variant={(selectedUser as any).isActive ? 'default' : 'secondary'}>
                    {(selectedUser as any).isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Data de Criação</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Diálogo de edição de utilizador
  function renderEditUserDialog() {
    return (
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
            <DialogDescription>
              Atualize as informações do utilizador
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Nome Completo *</Label>
                <Input
                  id="edit-fullName"
                  value={editingUser.fullName || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setEditingUser(prev => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bi">Bilhete de Identidade *</Label>
                <Input
                  id="edit-bi"
                  value={editingUser.bi || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setEditingUser(prev => ({ ...prev, bi: e.target.value }))
                  }
                  placeholder="Número do BI"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nif">NIF</Label>
                <Input
                  id="edit-nif"
                  value={editingUser.nif || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setEditingUser(prev => ({ ...prev, nif: e.target.value }))
                  }
                  placeholder="Número de Identificação Fiscal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone *</Label>
                <Input
                  id="edit-phone"
                  value={editingUser.phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setEditingUser(prev => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Número de telefone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setEditingUser(prev => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Endereço de email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-userType">Tipo de Utilizador *</Label>
                <Select
                  value={editingUser.userType || ''}
                  onValueChange={(value: "farmer" | "company" | "cooperative" | "financial_institution" | "admin") => 
                    setEditingUser(prev => ({ ...prev, userType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Agricultor</SelectItem>
                    <SelectItem value="company">Empresa</SelectItem>
                    <SelectItem value="cooperative">Cooperativa</SelectItem>
                    <SelectItem value="financial_institution">Instituição Financeira</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditUserDialog(false);
                  setEditingUser({});
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (editingUser.id && !updateUser.isPending) {
                    updateUser.mutate({ 
                      id: editingUser.id, 
                      userData: editingUser 
                    });
                  }
                }}
                disabled={updateUser.isPending || !editingUser.fullName || !editingUser.bi || !editingUser.phone || !editingUser.userType}
              >
                {updateUser.isPending ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Diálogo de confirmação de eliminação
  function renderDeleteConfirmDialog() {
    return (
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja eliminar este utilizador? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {userToDelete && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">{userToDelete.fullName}</p>
                <p className="text-sm text-gray-600">{userToDelete.email || userToDelete.phone}</p>
                <p className="text-sm text-gray-600">BI: {userToDelete.bi}</p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirmDialog(false);
                    setUserToDelete(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (userToDelete.id && !deleteUser.isPending && !loadingActions[`delete-${userToDelete.id}`]) {
                      deleteUser.mutate(userToDelete.id);
                    }
                  }}
                  disabled={deleteUser.isPending || Boolean(userToDelete?.id && loadingActions[`delete-${userToDelete.id}`])}
                >
                  {(deleteUser.isPending || (userToDelete?.id && loadingActions[`delete-${userToDelete.id}`])) ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}