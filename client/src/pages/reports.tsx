import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Download, FileText, BarChart3, PieChart, TrendingUp, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatKwanza, getProjectTypeLabel } from "@/lib/angola-utils";
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { CreditApplication, Account, Payment } from "@shared/schema";

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 6)),
    to: endOfMonth(new Date()),
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<CreditApplication[]>({
    queryKey: ["/api/credit-applications/user"],
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts/user"],
  });

  const { data: allPayments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/reports/payments"],
  });

  const isLoading = applicationsLoading || accountsLoading || paymentsLoading;

  // Filtrar dados por período
  const filteredApplications = applications.filter(app => 
    app.createdAt && 
    parseISO(app.createdAt.toString()) >= dateRange.from && 
    parseISO(app.createdAt.toString()) <= dateRange.to
  );

  const filteredPayments = allPayments.filter(payment => 
    payment.paymentDate && 
    parseISO(payment.paymentDate.toString()) >= dateRange.from && 
    parseISO(payment.paymentDate.toString()) <= dateRange.to
  );

  // Calcular estatísticas
  const stats = {
    totalApplications: filteredApplications.length,
    approvedApplications: filteredApplications.filter(app => app.status === "approved").length,
    rejectedApplications: filteredApplications.filter(app => app.status === "rejected").length,
    pendingApplications: filteredApplications.filter(app => app.status === "pending").length,
    totalCreditValue: filteredApplications.reduce((sum, app) => sum + parseFloat(app.amount), 0),
    approvedCreditValue: filteredApplications
      .filter(app => app.status === "approved")
      .reduce((sum, app) => sum + parseFloat(app.amount), 0),
    totalPayments: filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0),
    averageLoanSize: filteredApplications.length > 0 
      ? filteredApplications.reduce((sum, app) => sum + parseFloat(app.amount), 0) / filteredApplications.length 
      : 0,
  };

  // Distribuição por tipo de projeto
  const projectDistribution = filteredApplications.reduce((acc, app) => {
    acc[app.projectType] = (acc[app.projectType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Taxa de aprovação mensal
  const approvalRate = stats.totalApplications > 0 
    ? (stats.approvedApplications / stats.totalApplications) * 100 
    : 0;

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Relatório Financeiro AgriCredit', 20, 30);
      doc.setFontSize(12);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, 40);
      doc.text(`Usuário: ${user?.fullName}`, 20, 50);
      
      // Resumo estatístico
      doc.setFontSize(16);
      doc.text('Resumo Estatístico', 20, 70);
      
      const summaryData = [
        ['Total de Solicitações', stats.totalApplications.toString()],
        ['Solicitações Aprovadas', stats.approvedApplications.toString()],
        ['Solicitações Rejeitadas', stats.rejectedApplications.toString()],
        ['Solicitações Pendentes', stats.pendingApplications.toString()],
        ['Taxa de Aprovação', `${approvalRate.toFixed(1)}%`],
        ['Valor Total Solicitado', formatKwanza(stats.totalCreditValue)],
        ['Valor Total Aprovado', formatKwanza(stats.approvedCreditValue)],
        ['Total de Pagamentos', formatKwanza(stats.totalPayments)]
      ];

      autoTable(doc, {
        head: [['Métrica', 'Valor']],
        body: summaryData,
        startY: 80,
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80] },
      });

      // Solicitações detalhadas
      if (filteredApplications.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Solicitações de Crédito', 20, 30);

        const applicationData = filteredApplications.map(app => [
          app.projectName,
          getProjectTypeLabel(app.projectType),
          formatKwanza(app.amount),
          app.status === 'approved' ? 'Aprovada' : 
          app.status === 'rejected' ? 'Rejeitada' : 
          app.status === 'pending' ? 'Pendente' : 'Em Análise',
          format(parseISO(app.createdAt!.toString()), 'dd/MM/yyyy', { locale: ptBR })
        ]);

        autoTable(doc, {
          head: [['Projeto', 'Tipo', 'Montante', 'Estado', 'Data']],
          body: applicationData,
          startY: 40,
          theme: 'grid',
          headStyles: { fillColor: [76, 175, 80] },
        });
      }

      // Save PDF
      doc.save(`relatorio-agricredit-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "PDF exportado com sucesso!",
        description: "O relatório foi baixado para o seu dispositivo.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Resumo estatístico
      const summaryData = [
        ['Métrica', 'Valor'],
        ['Total de Solicitações', stats.totalApplications],
        ['Solicitações Aprovadas', stats.approvedApplications],
        ['Solicitações Rejeitadas', stats.rejectedApplications],
        ['Solicitações Pendentes', stats.pendingApplications],
        ['Taxa de Aprovação (%)', parseFloat(approvalRate.toFixed(1))],
        ['Valor Total Solicitado (AOA)', stats.totalCreditValue],
        ['Valor Total Aprovado (AOA)', stats.approvedCreditValue],
        ['Total de Pagamentos (AOA)', stats.totalPayments]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

      // Solicitações detalhadas
      if (filteredApplications.length > 0) {
        const applicationData = [
          ['Projeto', 'Tipo', 'Montante (AOA)', 'Estado', 'Data', 'Prazo (meses)']
        ];
        
        filteredApplications.forEach(app => {
          applicationData.push([
            app.projectName,
            getProjectTypeLabel(app.projectType),
            parseFloat(app.amount).toString(),
            app.status === 'approved' ? 'Aprovada' : 
            app.status === 'rejected' ? 'Rejeitada' : 
            app.status === 'pending' ? 'Pendente' : 'Em Análise',
            format(parseISO(app.createdAt!.toString()), 'dd/MM/yyyy', { locale: ptBR }),
            app.term.toString()
          ]);
        });

        const applicationsSheet = XLSX.utils.aoa_to_sheet(applicationData);
        XLSX.utils.book_append_sheet(workbook, applicationsSheet, 'Solicitações');
      }

      // Distribuição por tipo de projeto
      if (Object.keys(projectDistribution).length > 0) {
        const distributionData = [['Tipo de Projeto', 'Quantidade', 'Percentual']];
        Object.entries(projectDistribution).forEach(([type, count]) => {
          const percentage = ((count / stats.totalApplications) * 100).toFixed(1);
          distributionData.push([
            getProjectTypeLabel(type),
            count.toString(),
            `${percentage}%`
          ]);
        });

        const distributionSheet = XLSX.utils.aoa_to_sheet(distributionData);
        XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Distribuição');
      }

      // Generate and save Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `relatorio-agricredit-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast({
        title: "Excel exportado com sucesso!",
        description: "O relatório foi baixado para o seu dispositivo.",
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Erro ao exportar Excel",
        description: "Não foi possível gerar o relatório Excel.",
        variant: "destructive",
      });
    }
  };

  const exportReport = (format: "pdf" | "excel") => {
    if (format === "pdf") {
      exportToPDF();
    } else {
      exportToExcel();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-agri-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation('/dashboard')}
                variant="ghost"
                className="text-white hover:bg-agri-dark"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Relatórios Financeiros</h1>
                <p className="text-agri-secondary">Análise detalhada dos seus créditos agrícolas</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => exportReport("pdf")}
                variant="secondary"
                className="bg-agri-dark hover:bg-opacity-80"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                onClick={() => exportReport("excel")}
                variant="secondary"
                className="bg-agri-dark hover:bg-opacity-80"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros de Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Visão Geral</SelectItem>
                    <SelectItem value="applications">Solicitações</SelectItem>
                    <SelectItem value="payments">Pagamentos</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Período</label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({
                      from: startOfMonth(subMonths(new Date(), 3)),
                      to: endOfMonth(new Date()),
                    })}
                  >
                    Últimos 3 meses
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({
                      from: startOfMonth(subMonths(new Date(), 6)),
                      to: endOfMonth(new Date()),
                    })}
                  >
                    Últimos 6 meses
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({
                      from: startOfMonth(subMonths(new Date(), 12)),
                      to: endOfMonth(new Date()),
                    })}
                  >
                    Último ano
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-primary mx-auto mb-4"></div>
            <p className="text-gray-600">A carregar dados dos relatórios...</p>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total de Solicitações</p>
                      <p className="text-2xl font-bold text-agri-dark">{stats.totalApplications}</p>
                    </div>
                    <FileText className="text-blue-500 w-8 h-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Taxa de Aprovação</p>
                      <p className="text-2xl font-bold text-agri-dark">{approvalRate.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="text-green-500 w-8 h-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-agri-primary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Valor Total Aprovado</p>
                      <p className="text-2xl font-bold text-agri-dark">
                        {formatKwanza(stats.approvedCreditValue)}
                      </p>
                    </div>
                    <BarChart3 className="text-agri-primary w-8 h-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-agri-secondary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Recebido</p>
                      <p className="text-2xl font-bold text-agri-dark">
                        {formatKwanza(stats.totalPayments)}
                      </p>
                    </div>
                    <PieChart className="text-agri-secondary w-8 h-8" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Aprovadas</span>
                        <span className="text-sm text-gray-600">
                          {stats.approvedApplications} ({stats.totalApplications > 0 ? (stats.approvedApplications / stats.totalApplications * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                      <Progress 
                        value={stats.totalApplications > 0 ? (stats.approvedApplications / stats.totalApplications) * 100 : 0} 
                        className="h-2 bg-green-100"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Pendentes</span>
                        <span className="text-sm text-gray-600">
                          {stats.pendingApplications} ({stats.totalApplications > 0 ? (stats.pendingApplications / stats.totalApplications * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                      <Progress 
                        value={stats.totalApplications > 0 ? (stats.pendingApplications / stats.totalApplications) * 100 : 0} 
                        className="h-2 bg-yellow-100"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Rejeitadas</span>
                        <span className="text-sm text-gray-600">
                          {stats.rejectedApplications} ({stats.totalApplications > 0 ? (stats.rejectedApplications / stats.totalApplications * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                      <Progress 
                        value={stats.totalApplications > 0 ? (stats.rejectedApplications / stats.totalApplications) * 100 : 0} 
                        className="h-2 bg-red-100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo de Projeto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(projectDistribution).map(([type, count]) => (
                      <div key={type}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{getProjectTypeLabel(type)}</span>
                          <span className="text-sm text-gray-600">
                            {count} ({stats.totalApplications > 0 ? (count / stats.totalApplications * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                        <Progress 
                          value={stats.totalApplications > 0 ? (count / stats.totalApplications) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Applications Table */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Solicitações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Nenhuma solicitação encontrada no período selecionado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Projeto</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Montante</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredApplications.slice(0, 10).map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {application.createdAt ? format(new Date(application.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                            </td>
                            <td className="py-3 px-4 font-medium text-agri-dark">
                              {application.projectName}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {getProjectTypeLabel(application.projectType)}
                            </td>
                            <td className="py-3 px-4 font-semibold text-agri-dark">
                              {formatKwanza(parseFloat(application.amount))}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                application.status === "approved" ? "bg-green-100 text-green-800" :
                                application.status === "rejected" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {application.status === "approved" ? "Aprovado" :
                                 application.status === "rejected" ? "Rejeitado" : "Pendente"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}