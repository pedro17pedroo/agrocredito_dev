import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatKwanza, formatDate } from "@/lib/angola-utils";
import { 
  ArrowLeft,
  Check, 
  X, 
  Clock, 
  DollarSign, 
  FileText, 
  TrendingUp,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar,
  Settings,
  Building,
  MapPin,
  Users,
  Briefcase,
  Eye,
  Download
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface CreditApplication {
  id: string;
  userId: string;
  projectName: string;
  projectType: string;
  description: string;
  amount: string;
  term: number;
  status: "pending" | "under_review" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedBy?: string;
  approvedBy?: string;
  documents?: (string | {
    id: string;
    documentType: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    version: number;
    isRequired: boolean;
    createdAt: string;
  })[];
  documentTypes?: string[];
  createdAt: string;
  updatedAt: string;
  // Campos financeiros
  monthlyIncome?: string;
  expectedProjectIncome?: string;
  monthlyExpenses?: string;
  otherDebts?: string;
  familyMembers?: number;
  experienceYears?: number;
  productivity?: string;
  agricultureType?: string;
  creditDeliveryMethod?: string;
  guaranteeDescription?: string;
  user?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    userType: string;
    address?: string;
    city?: string;
    province?: string;
  };
}

export default function FinancialApplicationDetails() {
  const [, params] = useRoute("/financial-application/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Verificar se o usuário está autenticado e tem permissão
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar esta página.</p>
          <Button onClick={() => setLocation("/")}>
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  if (user.userType !== "admin" && user.userType !== "financial_institution") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta página.</p>
          <Button onClick={() => setLocation("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const applicationId = params?.id;

  // Query para buscar os detalhes da aplicação
  const { data: application, isLoading } = useQuery<CreditApplication>({
    queryKey: ["/api/admin/credit-applications", applicationId],
    enabled: !!applicationId,
  });

  // Mutation para atualizar o status da aplicação
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { 
      id: string; 
      status: string; 
      rejectionReason?: string; 
    }) => {
      const response = await apiRequest(
        "PUT",
        `/api/admin/credit-applications/${id}/status`,
        { status, rejectionReason }
      );
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-applications", applicationId] });
      toast({
        title: "Status atualizado",
        description: "O status da solicitação foi atualizado com sucesso.",
      });
      setShowRejectDialog(false);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar o status da solicitação.",
        variant: "destructive",
      });
    },
  });

  const statusLabels = {
    pending: "Pendente",
    under_review: "Em Análise",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    under_review: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const projectTypeLabels = {
    corn: "Milho",
    cassava: "Mandioca",
    cattle: "Pecuária",
    poultry: "Avicultura",
    horticulture: "Horticultura",
    other: "Outro",
  };

  const handleApprove = () => {
    if (!application) return;
    updateApplicationStatus.mutate({
      id: application.id,
      status: "approved",
    });
  };

  const handleStartReview = () => {
    if (!application) return;
    updateApplicationStatus.mutate({
      id: application.id,
      status: "under_review",
    });
  };

  const handleReject = () => {
    if (!application || !rejectionReason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, forneça um motivo para a rejeição.",
        variant: "destructive",
      });
      return;
    }
    updateApplicationStatus.mutate({
      id: application.id,
      status: "rejected",
      rejectionReason: rejectionReason.trim(),
    });
  };

  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/documents/download/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast({
          title: "Erro",
          description: "Erro ao fazer download do documento",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer download do documento",
        variant: "destructive",
      });
    }
  };

  const viewDocument = async (documentId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      // Abre diretamente o endpoint de visualização numa nova aba
      const viewUrl = `/api/documents/view/${documentId}?token=${encodeURIComponent(token || '')}`;
      window.open(viewUrl, '_blank');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao visualizar o documento",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const goBack = () => {
    setLocation("/financial-dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando detalhes da solicitação...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Solicitação não encontrada</h2>
          <p className="text-gray-600 mb-6">A solicitação que procura não existe ou foi removida.</p>
          <Button onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={goBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{application.projectName}</h1>
              <p className="text-gray-600 mt-1">
                Solicitação criada em {formatDate(application.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={statusColors[application.status]}>
                {statusLabels[application.status]}
              </Badge>
              <Badge variant="outline">
                {projectTypeLabels[application.projectType as keyof typeof projectTypeLabels]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Detalhes da Solicitação */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nome do Projeto</label>
                    <p className="text-gray-900">{application.projectName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tipo de Projeto</label>
                    <p className="text-gray-900">
                      {projectTypeLabels[application.projectType as keyof typeof projectTypeLabels]}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Valor Solicitado</label>
                    <p className="text-gray-900 font-semibold text-lg">
                      {formatKwanza(parseFloat(application.amount))}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Prazo</label>
                    <p className="text-gray-900">{application.term} meses</p>
                  </div>
                  {application.productivity && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nível de Produtividade</label>
                      <p className="text-gray-900">{application.productivity}</p>
                    </div>
                  )}
                  {application.agricultureType && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tipo de Agricultura</label>
                      <p className="text-gray-900">{application.agricultureType}</p>
                    </div>
                  )}
                  {application.creditDeliveryMethod && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Método de Entrega do Crédito</label>
                      <p className="text-gray-900">{application.creditDeliveryMethod}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Descrição do Projeto</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{application.description}</p>
                </div>
                
                {application.guaranteeDescription && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Descrição da Garantia</label>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">{application.guaranteeDescription}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Situação Financeira do Solicitante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Situação Financeira do Solicitante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.monthlyIncome && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Renda Mensal</label>
                      <p className="text-gray-900 font-semibold">
                        {formatKwanza(parseFloat(application.monthlyIncome))}
                      </p>
                    </div>
                  )}
                  {application.expectedProjectIncome && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Renda Esperada do Projeto</label>
                      <p className="text-gray-900 font-semibold">
                        {formatKwanza(parseFloat(application.expectedProjectIncome))}
                      </p>
                    </div>
                  )}
                  {application.monthlyExpenses && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Despesas Mensais</label>
                      <p className="text-gray-900">
                        {formatKwanza(parseFloat(application.monthlyExpenses))}
                      </p>
                    </div>
                  )}
                  {application.otherDebts && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Outras Dívidas</label>
                      <p className="text-gray-900">
                        {formatKwanza(parseFloat(application.otherDebts))}
                      </p>
                    </div>
                  )}
                  {application.familyMembers && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Membros da Família</label>
                      <p className="text-gray-900">{application.familyMembers} pessoas</p>
                    </div>
                  )}
                  {application.experienceYears && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Anos de Experiência</label>
                      <p className="text-gray-900">{application.experienceYears} anos</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documentos */}
            {application.documents && application.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentos Anexados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {application.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="text-sm font-medium">
                              {typeof doc === 'string' ? doc : (doc as any).originalFileName || (doc as any).documentType || 'Documento'}
                            </span>
                            {typeof doc !== 'string' && (doc as any).fileSize && (
                              <p className="text-xs text-gray-500">
                                {formatFileSize((doc as any).fileSize)}
                              </p>
                            )}
                          </div>
                        </div>
                        {typeof doc !== 'string' && (doc as any).id && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewDocument((doc as any).id, (doc as any).originalFileName || 'documento')}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-green-600"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadDocument((doc as any).id, (doc as any).originalFileName || 'documento')}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral - Informações do Solicitante e Ações */}
          <div className="space-y-6">
            {/* Informações do Solicitante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Solicitante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.user && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                      <p className="text-gray-900">{application.user.fullName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{application.user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{application.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {application.user.userType === 'family_farmer' ? 'Agricultor Familiar' : 
                         application.user.userType === 'agribusiness' ? 'Empresa Agrícola' : 
                         application.user.userType}
                      </span>
                    </div>
                    {application.user.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div className="text-sm text-gray-900">
                          <p>{application.user.address}</p>
                          {application.user.city && application.user.province && (
                            <p>{application.user.city}, {application.user.province}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.status === "pending" && (
                  <>
                    <Button
                      onClick={handleStartReview}
                      disabled={updateApplicationStatus.isPending}
                      className="w-full"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Iniciar Análise
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleApprove}
                      disabled={updateApplicationStatus.isPending}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aprovar Diretamente
                    </Button>
                  </>
                )}
                
                {application.status === "under_review" && (
                  <>
                    <Button
                      onClick={handleApprove}
                      disabled={updateApplicationStatus.isPending}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                  </>
                )}
                
                {(application.status === "pending" || application.status === "under_review") && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={updateApplicationStatus.isPending}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
                
                {application.status === "approved" && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-800 font-medium">Solicitação Aprovada</p>
                    {application.approvedBy && (
                      <p className="text-xs text-green-600 mt-1">Por: {application.approvedBy}</p>
                    )}
                  </div>
                )}
                
                {application.status === "rejected" && (
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <X className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-sm text-red-800 font-medium">Solicitação Rejeitada</p>
                    {application.rejectionReason && (
                      <p className="text-xs text-red-600 mt-2 text-left">
                        <strong>Motivo:</strong> {application.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de Rejeição */}
        {showRejectDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Rejeitar Solicitação</h3>
              <p className="text-sm text-gray-600 mb-4">
                Por favor, forneça um motivo para a rejeição desta solicitação.
              </p>
              <Textarea
                placeholder="Motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mb-4"
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || updateApplicationStatus.isPending}
                >
                  Rejeitar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}