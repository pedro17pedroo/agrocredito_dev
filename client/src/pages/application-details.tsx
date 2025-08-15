import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, DollarSign, FileText, User, Paperclip, Download, Eye } from "lucide-react";
import { formatKwanza, getProjectTypeLabel, getStatusLabel } from "@/lib/angola-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CreditApplication } from "@shared/schema";

// Tipo estendido para incluir documentos
type CreditApplicationWithDocuments = CreditApplication & {
  documents?: Array<{
    id: string;
    documentType: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    version: number;
    isRequired: boolean;
    createdAt: string;
  }>;
};

// Função para obter o rótulo do tipo de documento
function getDocumentTypeLabel(documentType: string): string {
  const labels: Record<string, string> = {
    bilhete_identidade: "Bilhete de Identidade",
    declaracao_soba: "Declaração do Soba",
    declaracao_administracao_municipal: "Declaração da Administração Municipal",
    comprovativo_actividade_agricola: "Comprovativo de Atividade Agrícola",
    atestado_residencia: "Atestado de Residência",
    outros: "Outros"
  };
  return labels[documentType] || documentType;
}

// Função para formatar o tamanho do arquivo
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para download de documentos
function downloadDocument(documentId: string, fileName: string) {
  const token = localStorage.getItem('auth_token');
  fetch(`/api/documents/download/${documentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  })
  .catch(error => {
    console.error('Erro ao fazer download:', error);
  });
}

// Função para visualizar documentos
function viewDocument(documentId: string, fileName: string) {
  try {
    const token = localStorage.getItem('auth_token');
    // Abre diretamente o endpoint de visualização numa nova aba
    const viewUrl = `/api/documents/view/${documentId}?token=${encodeURIComponent(token || '')}`;
    window.open(viewUrl, '_blank');
  } catch (error) {
    console.error('Erro ao visualizar documento:', error);
  }
}

export default function ApplicationDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const applicationId = params.id;

  const { data: application, isLoading } = useQuery<CreditApplicationWithDocuments>({
    queryKey: ['/api/credit-applications', applicationId],
    enabled: !!applicationId,
  });

  // Debug: verificar se os documentos estão chegando
  console.log('Application data:', application);
  console.log('Documents:', application?.documents);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Solicitação não encontrada</h1>
            <p className="text-gray-600 mb-6">A solicitação que procura não existe ou foi removida.</p>
            <Button onClick={() => setLocation('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatusLabel(application.status || 'pending');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/dashboard')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-agri-dark">Detalhes da Solicitação</h1>
                <p className="text-gray-600">Visualize todas as informações da sua solicitação</p>
              </div>
            </div>
            <Badge className={status.className}>
              {status.label}
            </Badge>
          </div>

          {/* Application Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-agri-primary" />
                  Informações do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome do Projeto</label>
                  <p className="text-lg font-semibold text-agri-dark">{application.projectName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo de Projeto</label>
                  <p className="text-lg">{getProjectTypeLabel(application.projectType)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Descrição</label>
                  <p className="text-gray-800 leading-relaxed">{application.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-agri-primary" />
                  Informações Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações do Crédito */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="text-sm font-medium text-green-700">Montante Solicitado</label>
                    <p className="text-2xl font-bold text-green-800 mt-1">{formatKwanza(application.amount)}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="text-sm font-medium text-blue-700">Prazo</label>
                    <p className="text-2xl font-bold text-blue-800 mt-1">{application.term} meses</p>
                  </div>
                  
                  {application.interestRate && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <label className="text-sm font-medium text-orange-700">Taxa de Juro</label>
                      <p className="text-2xl font-bold text-orange-800 mt-1">{application.interestRate}% anual</p>
                    </div>
                  )}
                </div>

                {/* Informações Financeiras do Solicitante */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Situação Financeira do Solicitante</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(application as any).monthlyIncome && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Rendimento Mensal Atual</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {formatKwanza(parseFloat((application as any).monthlyIncome))}
                        </p>
                      </div>
                    )}
                    
                    {(application as any).expectedProjectIncome && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Rendimento Esperado do Projeto</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {formatKwanza(parseFloat((application as any).expectedProjectIncome))}
                        </p>
                      </div>
                    )}
                    
                    {(application as any).monthlyExpenses && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Despesas Mensais</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {formatKwanza(parseFloat((application as any).monthlyExpenses))}
                        </p>
                      </div>
                    )}
                    
                    {(application as any).otherDebts && parseFloat((application as any).otherDebts) > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Outras Dívidas Mensais</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {formatKwanza(parseFloat((application as any).otherDebts))}
                        </p>
                      </div>
                    )}
                    
                    {(application as any).familyMembers && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Membros da Família</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {(application as any).familyMembers} pessoas
                        </p>
                      </div>
                    )}
                    
                    {(application as any).experienceYears !== undefined && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Experiência na Agricultura</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {(application as any).experienceYears} anos
                        </p>
                      </div>
                    )}
                    
                    {(application as any).productivity && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Nível de Produtividade</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {(() => {
                            const productivity = (application as any).productivity;
                            if (productivity === 'small') return 'Pequeno Produtor';
                            if (productivity === 'medium') return 'Médio Produtor';
                            if (productivity === 'large') return 'Grande Produtor';
                            return productivity || 'Não informado';
                          })()}
                        </p>
                      </div>
                    )}
                    
                    {(application as any).creditDeliveryMethod && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">Método de Entrega do Crédito</label>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {(() => {
                            const method = (application as any).creditDeliveryMethod;
                            if (method === 'total') return 'Entrega Total';
                            if (method === 'monthly') return 'Por Prestação Mensal';
                            return method || 'Não informado';
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Análise de Viabilidade */}
                {(application as any).monthlyIncome && (application as any).expectedProjectIncome && (application as any).monthlyExpenses && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Análise de Viabilidade</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-blue-700">Rendimento Total Esperado</label>
                          <p className="text-lg font-bold text-blue-800 mt-1">
                            {formatKwanza(
                              parseFloat((application as any).monthlyIncome) + 
                              parseFloat((application as any).expectedProjectIncome)
                            )}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">Rendimento atual + projeto</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-blue-700">Rendimento Líquido Estimado</label>
                          <p className="text-lg font-bold text-blue-800 mt-1">
                            {formatKwanza(
                              parseFloat((application as any).monthlyIncome) + 
                              parseFloat((application as any).expectedProjectIncome) - 
                              parseFloat((application as any).monthlyExpenses) - 
                              (parseFloat((application as any).otherDebts || '0'))
                            )}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">Após despesas e dívidas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-agri-primary" />
                  Estado da Solicitação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Estado Atual</label>
                  <div className="mt-2">
                    <Badge className={`${status.className} text-sm px-3 py-1`}>
                      {status.label}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Submissão</label>
                  <p className="text-lg">
                    {application.createdAt ? format(new Date(application.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '-'}
                  </p>
                </div>
                
                {application.updatedAt && application.updatedAt !== application.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Última Actualização</label>
                    <p className="text-lg">
                      {format(new Date(application.updatedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
                
                {application.rejectionReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Motivo da Rejeição</label>
                    <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      {application.rejectionReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Paperclip className="w-5 h-5 mr-2 text-agri-primary" />
                  Documentos Anexados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents && application.documents.length > 0 ? (
                  <div className="space-y-3">
                    {application.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-agri-primary" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.originalFileName}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Tipo: {getDocumentTypeLabel(doc.documentType)}</span>
                              <span>Tamanho: {formatFileSize(doc.fileSize)}</span>
                              <span>Versão: {doc.version}</span>
                              {doc.isRequired && (
                                <Badge variant="secondary" className="text-xs">
                                  Obrigatório
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Enviado em {format(new Date(doc.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewDocument(doc.id, doc.originalFileName)}
                            className="flex items-center space-x-2"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadDocument(doc.id, doc.originalFileName)}
                            className="flex items-center space-x-2"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                            <span>Baixar</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum documento foi anexado a esta solicitação.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline / Next Steps */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-agri-primary" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.status === 'pending' && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">Aguardando Análise</h4>
                    <p className="text-yellow-700 text-sm">
                      A sua solicitação está na fila para análise. Uma instituição financeira irá revisar 
                      os detalhes e entrar em contacto consigo em breve.
                    </p>
                  </div>
                )}
                
                {application.status === 'under_review' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Em Análise</h4>
                    <p className="text-blue-700 text-sm">
                      A sua solicitação está a ser analisada por uma instituição financeira. 
                      Pode ser contactado para informações adicionais.
                    </p>
                  </div>
                )}
                
                {application.status === 'approved' && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Aprovada!</h4>
                    <p className="text-green-700 text-sm">
                      Parabéns! A sua solicitação foi aprovada. Uma conta de crédito será criada 
                      e receberá os detalhes em breve.
                    </p>
                  </div>
                )}
                
                {application.status === 'rejected' && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">Rejeitada</h4>
                    <p className="text-red-700 text-sm">
                      Infelizmente, a sua solicitação não foi aprovada. Revise o motivo acima 
                      e considere submeter uma nova solicitação com as correções necessárias.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}