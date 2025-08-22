import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatKwanza } from "../../lib/angola-utils";
import { useCreditApplications } from "../../contexts/CreditApplicationContext";
import type { CreditApplication, Account } from "../../../../shared/schema";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users,
  CreditCard,
  Calendar,
  Download,
  FileText
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export default function FinancialReports() {
  const { applications, loading, fetchApplications } = useCreditApplications();

  // Carregar aplicações quando o componente é montado
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Query for applications data (mantido para compatibilidade com admin)
  const { data: applicationsData } = useQuery<{
    new: CreditApplication[];
    underReview: CreditApplication[];
    historical: CreditApplication[];
  }>({
    queryKey: ["/api/admin/credit-applications"],
  });

  // Query for accounts data
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/admin/accounts"],
  });

  const newApplications = applicationsData?.new || [];
  const underReviewApplications = applicationsData?.underReview || [];
  const historicalApplications = applicationsData?.historical || [];
  const allApplications = [...newApplications, ...underReviewApplications, ...historicalApplications];

  // Calculate statistics
  const totalApplications = allApplications.length;
  const approvedApplications = historicalApplications.filter(app => app.status === 'approved').length;
  const rejectedApplications = historicalApplications.filter(app => app.status === 'rejected').length;
  const approvalRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(1) : '0';
  
  const totalValueRequested = allApplications.reduce((sum, app) => sum + parseFloat(app.amount), 0);
  const totalValueApproved = accounts.reduce((sum: number, acc: Account) => sum + parseFloat(acc.totalAmount), 0);
  const totalOutstanding = accounts.reduce((sum: number, acc: Account) => sum + parseFloat(acc.outstandingBalance), 0);

  // Project type distribution
  const projectTypes = allApplications.reduce((acc: Record<string, number>, app: CreditApplication) => {
    acc[app.projectType] = (acc[app.projectType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const projectTypeLabels = {
    corn: "Milho",
    cassava: "Mandioca", 
    cattle: "Pecuária",
    poultry: "Avicultura",
    horticulture: "Horticultura",
    other: "Outro",
  };

  // Função para exportar dados para Excel
  const exportToExcel = () => {
    const data = [
      ['Relatório Financeiro - Instituição Financeira'],
      [''],
      ['Estatísticas Gerais'],
      ['Total de Solicitações', totalApplications],
      ['Taxa de Aprovação', `${approvalRate}%`],
      ['Valor Total Aprovado', formatKwanza(totalValueApproved)],
      ['Saldo Total Devedor', formatKwanza(totalOutstanding)],
      [''],
      ['Distribuição por Estado'],
      ['Pendentes', newApplications.length, `${totalApplications > 0 ? ((newApplications.length / totalApplications) * 100).toFixed(0) : 0}%`],
      ['Em Análise', underReviewApplications.length, `${totalApplications > 0 ? ((underReviewApplications.length / totalApplications) * 100).toFixed(0) : 0}%`],
      ['Aprovadas', approvedApplications, `${totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(0) : 0}%`],
      ['Rejeitadas', rejectedApplications, `${totalApplications > 0 ? ((rejectedApplications / totalApplications) * 100).toFixed(0) : 0}%`],
      [''],
      ['Tipos de Projeto'],
      ...Object.entries(projectTypes).map(([type, count]) => [
        projectTypeLabels[type as keyof typeof projectTypeLabels] || type,
        count,
        `${totalApplications > 0 ? ((count / totalApplications) * 100).toFixed(0) : 0}%`
      ]),
      [''],
      ['Resumo Financeiro'],
      ['Valor Total Solicitado', formatKwanza(totalValueRequested)],
      ['Valor Total Aprovado', formatKwanza(totalValueApproved)],
      ['Saldo em Aberto', formatKwanza(totalOutstanding)],
      ['Taxa de Recuperação', totalValueApproved > 0 ? `${(((totalValueApproved - totalOutstanding) / totalValueApproved) * 100).toFixed(1)}%` : '0%']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Relatório Financeiro');
     
     // Definir largura das colunas
     const colWidths = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
     ws['!cols'] = colWidths;

     XLSX.writeFile(wb, `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Função para exportar relatório em PDF
  const exportToPDF = async () => {
    const element = document.getElementById('financial-reports-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Adicionar título
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório Financeiro', 105, 15, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-AO')}`, 105, 25, { align: 'center' });
      
      position = 35;
      
      // Adicionar imagem do relatório
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - position;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + position;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botões de Exportação */}
      <div className="flex justify-end space-x-4 mb-6">
        <Button
          onClick={exportToExcel}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Exportar Excel</span>
        </Button>
        <Button
          onClick={exportToPDF}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Exportar PDF</span>
        </Button>
      </div>

      {/* Conteúdo do Relatório */}
      <div id="financial-reports-content" className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Desde o início da operação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {approvedApplications} de {totalApplications} aprovadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Aprovado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKwanza(totalValueApproved)}</div>
            <p className="text-xs text-muted-foreground">
              Em {accounts.length} contas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total Devedor</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKwanza(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              Valor a receber
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Estado</CardTitle>
            <CardDescription>
              Estado atual das solicitações de crédito
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Pendentes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{newApplications.length}</span>
                <Badge variant="outline">{totalApplications > 0 ? ((newApplications.length / totalApplications) * 100).toFixed(0) : 0}%</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Em Análise</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{underReviewApplications.length}</span>
                <Badge variant="outline">{totalApplications > 0 ? ((underReviewApplications.length / totalApplications) * 100).toFixed(0) : 0}%</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Aprovadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{approvedApplications}</span>
                <Badge variant="outline">{totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(0) : 0}%</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Rejeitadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{rejectedApplications}</span>
                <Badge variant="outline">{totalApplications > 0 ? ((rejectedApplications / totalApplications) * 100).toFixed(0) : 0}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Types */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Projeto</CardTitle>
            <CardDescription>
              Distribuição por sector agrícola
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(projectTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {projectTypeLabels[type as keyof typeof projectTypeLabels] || type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{count}</span>
                  <Badge variant="outline">
                    {totalApplications > 0 ? ((count / totalApplications) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
            ))}
            {Object.keys(projectTypes).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma solicitação registada ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
          <CardDescription>
            Visão geral dos valores e montantes geridos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Valor Total Solicitado</p>
              <p className="text-2xl font-bold">{formatKwanza(totalValueRequested)}</p>
              <p className="text-xs text-gray-500">
                Todas as solicitações recebidas
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Valor Total Aprovado</p>
              <p className="text-2xl font-bold text-green-600">{formatKwanza(totalValueApproved)}</p>
              <p className="text-xs text-gray-500">
                Créditos concedidos e ativos
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Saldo em Aberto</p>
              <p className="text-2xl font-bold text-blue-600">{formatKwanza(totalOutstanding)}</p>
              <p className="text-xs text-gray-500">
                Valor ainda por receber
              </p>
            </div>
          </div>
          
          {totalValueApproved > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Taxa de Recuperação</span>
                <span className="font-medium">
                  {(((totalValueApproved - totalOutstanding) / totalValueApproved) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${((totalValueApproved - totalOutstanding) / totalValueApproved) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}