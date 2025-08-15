import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatKwanza, formatDate } from "@/lib/angola-utils";
import { 
  Eye, 
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
  Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
  documents?: string[];
  documentTypes?: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    userType: string;
  };
}

interface Account {
  id: string;
  applicationId: string;
  userId: string;
  financialInstitutionId: string;
  totalAmount: string;
  outstandingBalance: string;
  monthlyPayment: string;
  nextPaymentDate: string;
  isActive: boolean;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
}

interface ApplicationsData {
  new: CreditApplication[];
  underReview: CreditApplication[];
  historical: CreditApplication[];
}

export default function CreditApplicationsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [selectedApplication, setSelectedApplication] = useState<CreditApplication | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Query for credit applications
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery<ApplicationsData>({
    queryKey: ["/api/admin/credit-applications"],
  });

  // Query for accounts (approved credits)
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/admin/accounts"],
  });

  // Mutation to update application status
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { 
      id: string; 
      status: string; 
      rejectionReason?: string;
    }) => {
      return apiRequest("PATCH", `/api/admin/credit-applications/${id}/status`, {
        status,
        rejectionReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      setShowApplicationDetails(false);
      setSelectedApplication(null);
      setRejectionReason("");
      toast({
        title: "Sucesso",
        description: "Estado da solicitação atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar estado da solicitação",
        variant: "destructive",
      });
    },
  });

  if (applicationsLoading || accountsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg">A carregar solicitações...</p>
        </div>
      </div>
    );
  }

  const newApplications = applicationsData?.new || [];
  const underReviewApplications = applicationsData?.underReview || [];
  const historicalApplications = applicationsData?.historical || [];
  const approvedCredits = accounts;

  const statusLabels = {
    pending: "Pendente",
    under_review: "Em Análise",
    approved: "Aprovada",
    rejected: "Rejeitada",
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

  const handleViewApplication = (application: CreditApplication) => {
    setLocation(`/financial-application/${application.id}`);
  };

  const handleApprove = (application: CreditApplication) => {
    updateApplicationStatus.mutate({
      id: application.id,
      status: "approved",
    });
  };

  const handleReject = (application: CreditApplication) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, indique o motivo da rejeição",
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

  const handleStartReview = (application: CreditApplication) => {
    updateApplicationStatus.mutate({
      id: application.id,
      status: "under_review",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas Solicitações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newApplications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underReviewApplications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Geridos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCredits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Gerido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKwanza(
                approvedCredits.reduce((sum, account) => sum + parseFloat(account.totalAmount), 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new">
            Novas Solicitações ({newApplications.length})
          </TabsTrigger>
          <TabsTrigger value="review">
            Em Análise ({underReviewApplications.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Créditos Aprovados ({approvedCredits.length})
          </TabsTrigger>
          <TabsTrigger value="historical">
            Histórico ({historicalApplications.length})
          </TabsTrigger>
        </TabsList>

        {/* New Applications */}
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novas Solicitações de Crédito</CardTitle>
              <CardDescription>
                Solicitações aguardando análise de uma instituição financeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              {newApplications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Não há novas solicitações para analisar.
                </p>
              ) : (
                <div className="space-y-4">
                  {newApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{application.projectName}</h3>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                            <Badge variant="outline">
                              {projectTypeLabels[application.projectType as keyof typeof projectTypeLabels]}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Valor:</strong> {formatKwanza(parseFloat(application.amount))}</p>
                            <p><strong>Prazo:</strong> {application.term} meses</p>
                            <p><strong>Solicitado em:</strong> {formatDate(application.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStartReview(application)}
                            disabled={updateApplicationStatus.isPending}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Analisar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Under Review Applications */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações em Análise</CardTitle>
              <CardDescription>
                Solicitações que está a analisar atualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {underReviewApplications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Não há solicitações em análise no momento.
                </p>
              ) : (
                <div className="space-y-4">
                  {underReviewApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{application.projectName}</h3>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                            <Badge variant="outline">
                              {projectTypeLabels[application.projectType as keyof typeof projectTypeLabels]}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Valor:</strong> {formatKwanza(parseFloat(application.amount))}</p>
                            <p><strong>Prazo:</strong> {application.term} meses</p>
                            <p><strong>Em análise desde:</strong> {formatDate(application.updatedAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Credits */}
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Créditos Aprovados e Geridos</CardTitle>
              <CardDescription>
                Contas de crédito que aprovou e está a gerir
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedCredits.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Ainda não aprovou nenhum crédito.
                </p>
              ) : (
                <div className="space-y-4">
                  {approvedCredits.map((account) => (
                    <div key={account.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">
                              {account.user?.fullName || "Cliente"}
                            </h3>
                            <Badge className="bg-green-100 text-green-800">
                              Ativo
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Valor Total:</strong> {formatKwanza(parseFloat(account.totalAmount))}</p>
                            <p><strong>Saldo Devedor:</strong> {formatKwanza(parseFloat(account.outstandingBalance))}</p>
                            <p><strong>Prestação Mensal:</strong> {formatKwanza(parseFloat(account.monthlyPayment))}</p>
                            <p><strong>Próximo Pagamento:</strong> {formatDate(account.nextPaymentDate)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Conta
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Applications */}
        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Decisões</CardTitle>
              <CardDescription>
                Todas as solicitações já analisadas e decididas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historicalApplications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Ainda não tomou decisões sobre solicitações.
                </p>
              ) : (
                <div className="space-y-4">
                  {historicalApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{application.projectName}</h3>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                            <Badge variant="outline">
                              {projectTypeLabels[application.projectType as keyof typeof projectTypeLabels]}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Valor:</strong> {formatKwanza(parseFloat(application.amount))}</p>
                            <p><strong>Prazo:</strong> {application.term} meses</p>
                            <p><strong>Decisão em:</strong> {formatDate(application.updatedAt)}</p>
                            {application.rejectionReason && (
                              <p><strong>Motivo da rejeição:</strong> {application.rejectionReason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Details Dialog */}
      <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-agri-dark">Detalhes da Solicitação de Crédito</DialogTitle>
            <DialogDescription>
              Análise completa da solicitação para decisão de aprovação
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className={`text-sm px-3 py-1 ${statusColors[selectedApplication.status]}`}>
                  {statusLabels[selectedApplication.status]}
                </Badge>
                <div className="text-sm text-gray-500">
                  Solicitação criada em {formatDate(selectedApplication.createdAt)}
                </div>
              </div>

              <Separator />

              {/* Informações do Projeto */}
              <div>
                <h3 className="text-lg font-semibold text-agri-dark mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Informações do Projeto
                </h3>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome do Projeto</label>
                      <p className="text-base font-medium text-gray-900">{selectedApplication.projectName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tipo de Projeto</label>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-sm">
                          {projectTypeLabels[selectedApplication.projectType as keyof typeof projectTypeLabels]}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tipo de Agricultura</label>
                      <p className="text-base text-gray-900">{(selectedApplication as any).agricultureType || 'Não especificado'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nível de Produtividade</label>
                      <p className="text-base text-gray-900">
                        {(() => {
                          const productivity = (selectedApplication as any).productivity;
                          if (productivity === 'small') return 'Pequeno Produtor';
                          if (productivity === 'medium') return 'Médio Produtor';
                          if (productivity === 'large') return 'Grande Produtor';
                          return productivity || 'Não especificado';
                        })()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Método de Entrega do Crédito</label>
                      <p className="text-base text-gray-900">
                        {(() => {
                          const method = (selectedApplication as any).creditDeliveryMethod;
                          if (method === 'total') return 'Entrega Total';
                          if (method === 'monthly') return 'Por Prestação Mensal';
                          return method || 'Não especificado';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Descrição do Projeto</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-800 leading-relaxed">{selectedApplication.description}</p>
                  </div>
                </div>
                {(selectedApplication as any).creditGuaranteeDeclaration && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Declaração de Garantia</label>
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-900 leading-relaxed">{(selectedApplication as any).creditGuaranteeDeclaration}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Informações Financeiras */}
              <div>
                <h3 className="text-lg font-semibold text-agri-dark mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Informações Financeiras
                </h3>
                
                {/* Informações do Crédito */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Detalhes do Crédito Solicitado</h4>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <label className="text-sm font-medium text-green-700">Valor Solicitado</label>
                      <p className="text-2xl font-bold text-green-800 mt-1">
                        {formatKwanza(parseFloat(selectedApplication.amount))}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <label className="text-sm font-medium text-blue-700">Prazo de Pagamento</label>
                      <p className="text-2xl font-bold text-blue-800 mt-1">{selectedApplication.term} meses</p>
                    </div>
                    {(selectedApplication as any).interestRate && (
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <label className="text-sm font-medium text-orange-700">Taxa de Juro</label>
                        <p className="text-2xl font-bold text-orange-800 mt-1">{(selectedApplication as any).interestRate}%</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Situação Financeira do Solicitante */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Situação Financeira do Solicitante</h4>
                  <div className="space-y-4">
                    {(selectedApplication as any).monthlyIncome && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Rendimento Mensal Atual</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {formatKwanza(parseFloat((selectedApplication as any).monthlyIncome))}
                        </p>
                      </div>
                    )}
                    
                    {(selectedApplication as any).expectedProjectIncome && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Rendimento Esperado do Projeto</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {formatKwanza(parseFloat((selectedApplication as any).expectedProjectIncome))}
                        </p>
                      </div>
                    )}
                    
                    {(selectedApplication as any).monthlyExpenses && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Despesas Mensais</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {formatKwanza(parseFloat((selectedApplication as any).monthlyExpenses))}
                        </p>
                      </div>
                    )}
                    
                    {(selectedApplication as any).otherDebts && parseFloat((selectedApplication as any).otherDebts) > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Outras Dívidas Mensais</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {formatKwanza(parseFloat((selectedApplication as any).otherDebts))}
                        </p>
                      </div>
                    )}
                    
                    {(selectedApplication as any).familyMembers && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Membros da Família</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {(selectedApplication as any).familyMembers} pessoas
                        </p>
                      </div>
                    )}
                    
                    {(selectedApplication as any).experienceYears !== undefined && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Experiência na Agricultura</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {(selectedApplication as any).experienceYears} anos
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Análise de Capacidade de Pagamento */}
                {(selectedApplication as any).monthlyIncome && (selectedApplication as any).expectedProjectIncome && (selectedApplication as any).monthlyExpenses && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Análise de Capacidade de Pagamento</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-blue-700">Rendimento Total Esperado</label>
                          <p className="text-lg font-bold text-blue-800 mt-1">
                            {formatKwanza(
                              parseFloat((selectedApplication as any).monthlyIncome) + 
                              parseFloat((selectedApplication as any).expectedProjectIncome)
                            )}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">Rendimento atual + projeto</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-blue-700">Rendimento Líquido Estimado</label>
                          <p className="text-lg font-bold text-blue-800 mt-1">
                            {formatKwanza(
                              parseFloat((selectedApplication as any).monthlyIncome) + 
                              parseFloat((selectedApplication as any).expectedProjectIncome) - 
                              parseFloat((selectedApplication as any).monthlyExpenses) - 
                              (parseFloat((selectedApplication as any).otherDebts || '0'))
                            )}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">Após despesas e dívidas</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-blue-700">Taxa de Esforço Estimada</label>
                          <p className="text-lg font-bold text-blue-800 mt-1">
                            {(() => {
                              const totalIncome = parseFloat((selectedApplication as any).monthlyIncome) + parseFloat((selectedApplication as any).expectedProjectIncome);
                              const monthlyPayment = parseFloat(selectedApplication.amount) / selectedApplication.term;
                              const effortRate = totalIncome > 0 ? (monthlyPayment / totalIncome * 100) : 0;
                              return `${effortRate.toFixed(1)}%`;
                            })()}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">Pagamento/Rendimento total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Dados do Cliente */}
              {selectedApplication.user && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-agri-dark mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Dados do Cliente
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                            <p className="text-base font-medium text-gray-900">{selectedApplication.user.fullName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Tipo de Cliente</label>
                            <Badge variant="secondary" className="mt-1">
                              {selectedApplication.user.userType === 'farmer' ? 'Agricultor Individual' : 
                               selectedApplication.user.userType === 'company' ? 'Empresa' :
                               selectedApplication.user.userType === 'cooperative' ? 'Cooperativa' : 
                               selectedApplication.user.userType}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Telefone</label>
                            <p className="text-base text-gray-900">{selectedApplication.user.phone}</p>
                          </div>
                          {selectedApplication.user.email && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Email</label>
                              <p className="text-base text-gray-900">{selectedApplication.user.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Documentação Submetida */}
              <div>
                <h3 className="text-lg font-semibold text-agri-dark mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documentação Submetida
                </h3>
                
                {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                  <div className="space-y-4">
                    {/* Status da Documentação */}
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900">Documentos Submetidos</p>
                          <p className="text-sm text-green-700">{selectedApplication.documents.length} documento(s) anexado(s)</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Completo
                      </Badge>
                    </div>

                    {/* Lista de Documentos */}
                    <div className="space-y-3">
                      {selectedApplication.documents.map((docUrl, index) => {
                        const docType = selectedApplication.documentTypes?.[index] || `Documento ${index + 1}`;
                        const fileName = docUrl.split('/').pop() || docUrl;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{docType}</p>
                                <p className="text-sm text-gray-500">{fileName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    PDF
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">Submetido</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(docUrl, '_blank')}
                                className="hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = docUrl;
                                  link.download = fileName;
                                  link.click();
                                }}
                                className="hover:bg-green-50 hover:border-green-300"
                              >
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Baixar
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Checklist de Documentos Obrigatórios */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Checklist de Documentos Obrigatórios
                      </h4>
                      <div className="space-y-3">
                        {selectedApplication.user?.userType === 'farmer' ? (
                          [
                            'Bilhete de Identidade (cópia)',
                            'Comprovativo de Residência',
                            'Declaração de Rendimentos',
                            'Plano de Negócio do Projeto Agrícola',
                            'Comprovativo de Posse/Uso da Terra',
                            'Declaração do Soba/Administração'
                          ].map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-blue-800">{doc}</span>
                            </div>
                          ))
                        ) : (
                          [
                            'Certidão Comercial da Empresa',
                            'NIF da Empresa',
                            'Estatutos da Empresa',
                            'Demonstrações Financeiras (2 anos)',
                            'Plano de Negócio Detalhado',
                            'Comprovativo de Licenciamento'
                          ].map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-blue-800">{doc}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-red-300 rounded-lg bg-red-50">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <h4 className="font-medium text-red-900 mb-2">Documentação Incompleta</h4>
                    <p className="text-red-700 mb-4">Nenhum documento foi submetido pelo cliente</p>
                    <div className="text-left max-w-md mx-auto">
                      <p className="text-sm font-medium text-red-800 mb-2">Documentos obrigatórios em falta:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {selectedApplication.user?.userType === 'farmer' ? (
                          <>
                            <li>• Bilhete de Identidade (cópia)</li>
                            <li>• Comprovativo de Residência</li>
                            <li>• Declaração de Rendimentos</li>
                            <li>• Plano de Negócio do Projeto Agrícola</li>
                            <li>• Comprovativo de Posse/Uso da Terra</li>
                          </>
                        ) : (
                          <>
                            <li>• Certidão Comercial da Empresa</li>
                            <li>• NIF da Empresa</li>
                            <li>• Estatutos da Empresa</li>
                            <li>• Demonstrações Financeiras (2 anos)</li>
                            <li>• Plano de Negócio Detalhado</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Análise de Risco e Recomendações */}
              <div>
                <h3 className="text-lg font-semibold text-agri-dark mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Análise de Risco e Recomendações
                </h3>
                <div className="space-y-6">
                  {/* Score de Risco */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Score de Risco</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-green-700">B+</span>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Risco Moderado</p>
                        <p className="text-xs text-blue-600">Baseado em documentação e histórico</p>
                      </div>
                    </div>
                  </div>

                  {/* Capacidade de Pagamento */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-3">Capacidade de Pagamento</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Valor Mensal Estimado:</span>
                        <span className="font-medium text-green-800">
                          {formatKwanza(parseFloat(selectedApplication.amount) / selectedApplication.term)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Taxa de Esforço:</span>
                        <span className="font-medium text-green-800">25%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recomendações */}
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Recomendações para Análise
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Verificar comprovativo de rendimentos dos últimos 6 meses</li>
                    <li>• Confirmar posse/uso da terra através de visita técnica</li>
                    <li>• Avaliar viabilidade técnica do projeto agrícola</li>
                    <li>• Considerar garantias adicionais se necessário</li>
                  </ul>
                </div>
              </div>

              <Separator />

              {/* Estado da Solicitação */}
              <div>
                <h3 className="text-lg font-semibold text-agri-dark mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Estado da Solicitação
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedApplication.status === 'pending' ? 'bg-yellow-500' :
                      selectedApplication.status === 'under_review' ? 'bg-blue-500' :
                      selectedApplication.status === 'approved' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Status Atual</p>
                      <p className="text-sm text-gray-600">
                        {selectedApplication.status === 'pending' && 'Aguardando análise inicial'}
                        {selectedApplication.status === 'under_review' && 'Em processo de análise detalhada'}
                        {selectedApplication.status === 'approved' && 'Solicitação aprovada'}
                        {selectedApplication.status === 'rejected' && 'Solicitação rejeitada'}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-sm px-3 py-1 ${statusColors[selectedApplication.status]}`}>
                    {statusLabels[selectedApplication.status]}
                  </Badge>
                </div>
                
                {/* Timeline de Ações */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Solicitação Criada</p>
                      <p className="text-sm text-gray-500">{formatDate(selectedApplication.createdAt)}</p>
                    </div>
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  
                  {selectedApplication.status !== 'pending' && (
                    <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Análise Iniciada</p>
                        <p className="text-sm text-gray-500">Documentação em revisão</p>
                      </div>
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Ações da Instituição Financeira */}
              <div>
                <h3 className="text-lg font-semibold text-agri-dark mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ações da Instituição
                </h3>
                
                {selectedApplication.status === 'pending' || selectedApplication.status === 'under_review' ? (
                  <div className="space-y-4">
                    {/* Aprovar */}
                    <button 
                      onClick={() => selectedApplication && handleApprove(selectedApplication)}
                      disabled={updateApplicationStatus.isPending}
                      className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-green-900 mb-1">Aprovar</h4>
                      <p className="text-sm text-green-700 text-center">Aprovar solicitação de crédito</p>
                    </button>

                    {/* Colocar em Análise */}
                    {selectedApplication.status === 'pending' && (
                      <button 
                        onClick={() => selectedApplication && handleStartReview(selectedApplication)}
                        disabled={updateApplicationStatus.isPending}
                        className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-blue-900 mb-1">Em Análise</h4>
                        <p className="text-sm text-blue-700 text-center">Colocar em análise detalhada</p>
                      </button>
                    )}

                    {/* Recusar */}
                    <div className="flex flex-col">
                      <button 
                        onClick={() => selectedApplication && handleReject(selectedApplication)}
                        disabled={updateApplicationStatus.isPending || !rejectionReason.trim()}
                        className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-lg hover:from-red-100 hover:to-rose-100 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-200 transition-colors">
                          <X className="w-6 h-6 text-red-600" />
                        </div>
                        <h4 className="font-semibold text-red-900 mb-1">Recusar</h4>
                        <p className="text-sm text-red-700 text-center">Recusar solicitação</p>
                      </button>
                      
                      {/* Campo de motivo da rejeição */}
                      <div className="mt-4">
                        <Textarea
                          placeholder="Indique o motivo da rejeição..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="min-h-20 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {selectedApplication.status === 'approved' ? (
                        <Check className="w-8 h-8 text-green-600" />
                      ) : (
                        <X className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {selectedApplication.status === 'approved' ? 'Solicitação Aprovada' : 'Solicitação Rejeitada'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedApplication.status === 'approved' 
                        ? 'Esta solicitação foi aprovada e o crédito pode ser liberado.'
                        : `Esta solicitação foi rejeitada. ${selectedApplication.rejectionReason ? `Motivo: ${selectedApplication.rejectionReason}` : ''}`
                      }
                    </p>
                    {selectedApplication.status === 'approved' && (
                      <Button className="mt-4" variant="default">
                        Liberar Crédito
                      </Button>
                    )}
                  </div>
                )}

                {/* Notas Internas */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Notas Internas
                  </h4>
                  <Textarea 
                    className="min-h-20 resize-none"
                    placeholder="Adicionar notas sobre a análise desta solicitação..."
                  />
                  <div className="flex justify-end mt-3">
                    <Button size="sm" variant="default">
                      Salvar Nota
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowApplicationDetails(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}