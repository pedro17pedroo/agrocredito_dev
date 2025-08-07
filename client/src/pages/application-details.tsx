import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, DollarSign, FileText, User } from "lucide-react";
import { formatKwanza, getProjectTypeLabel, getStatusLabel } from "@/lib/angola-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CreditApplication } from "@shared/schema";

export default function ApplicationDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const applicationId = params.id;

  const { data: application, isLoading } = useQuery<CreditApplication>({
    queryKey: ['/api/credit-applications', applicationId],
    enabled: !!applicationId,
  });

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
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Montante Solicitado</label>
                  <p className="text-2xl font-bold text-agri-primary">{formatKwanza(application.amount)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Prazo</label>
                  <p className="text-lg">{application.term} meses</p>
                </div>
                
                {application.interestRate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Taxa de Juro</label>
                    <p className="text-lg">{application.interestRate}% anual</p>
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

            {/* Timeline / Next Steps */}
            <Card>
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