import React, { useState } from 'react';
import { Download, FileText, BarChart3, PieChart, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CreditApplication, Account, Payment } from "@shared/schema";

// Função de toast simples
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message)
};

// Função para formatar valores em Kwanza
const formatKwanza = (value: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2
  }).format(value);
};

// Função para obter label do tipo de projeto
const getProjectTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'corn': 'Cultivo de Milho',
    'cassava': 'Cultivo de Mandioca',
    'cattle': 'Criação de Gado',
    'poultry': 'Avicultura',
    'horticulture': 'Horticultura',
    'crop': 'Cultivo',
    'livestock': 'Pecuária',
    'equipment': 'Equipamentos',
    'infrastructure': 'Infraestrutura',
    'other': 'Outro'
  };
  return labels[type] || type;
};

// Componentes UI básicos
type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  [key: string]: any;
}

const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 text-gray-700'
  };
  
  const sizes: Record<ButtonSize, string> = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8'
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }: any) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }: any) => (
  <div className={`p-6 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }: any) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '', ...props }: any) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

const Select = ({ children, value, onValueChange, ...props }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  const getSelectedLabel = () => {
    let selectedLabel = value || 'Selecionar...';
    React.Children.forEach(children, (child) => {
      if (child?.type?.name === 'SelectContent') {
        React.Children.forEach(child.props.children, (item) => {
          if (item?.props?.value === value) {
            selectedLabel = item.props.children;
          }
        });
      }
    });
    return selectedLabel;
  };

  return (
    <div className="relative" {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        <span>{getSelectedLabel()}</span>
        <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {React.Children.map(children, (child) => {
            if (child?.type?.name === 'SelectContent') {
              return React.cloneElement(child, { onValueChange: handleValueChange, setIsOpen });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({ children, ...props }: any) => children;
const SelectValue = ({ placeholder, ...props }: any) => placeholder;
const SelectContent = ({ children, onValueChange, setIsOpen, ...props }: any) => (
  <div {...props}>
    {React.Children.map(children, (child) => {
      if (child?.type?.name === 'SelectItem') {
        return React.cloneElement(child, { onValueChange, setIsOpen });
      }
      return child;
    })}
  </div>
);
const SelectItem = ({ children, value, onValueChange, setIsOpen, ...props }: any) => (
  <div
    onClick={() => {
      onValueChange?.(value);
      setIsOpen?.(false);
    }}
    className="px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
    {...props}
  >
    {children}
  </div>
);

const Progress = ({ value, className = '', ...props }: any) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`} {...props}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
    />
  </div>
);

// Hooks reais
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

import { useLocation } from 'wouter';

// Extend jsPDF type to include lastAutoTable property
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export default function Reports() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [reportType, setReportType] = useState("overview");
  const [activePeriod, setActivePeriod] = useState("all"); // Para controlar qual botão está ativo
  const [dateRange, setDateRange] = useState({
    from: new Date(2020, 0, 1), // Mostrar todas as aplicações por padrão
    to: new Date(),
  });
  
  // Log quando dateRange muda
  React.useEffect(() => {
    console.log('📅 [DATERANGE] DateRange alterado:', {
      from: dateRange.from,
      to: dateRange.to,
      fromFormatted: format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR }),
      toFormatted: format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })
    });
  }, [dateRange]);

  // Funções para alterar o período
  const setPeriod = (months: number) => {
    const newDateRange = {
      from: startOfMonth(subMonths(new Date(), months)),
      to: endOfMonth(new Date()),
    };
    console.log(`🔄 [FILTRO] Definindo período para ${months} meses:`, newDateRange);
    setActivePeriod(`${months}months`);
    setDateRange(newDateRange);
  };

  const setLastYear = () => {
    const newDateRange = {
      from: startOfMonth(subMonths(new Date(), 12)),
      to: endOfMonth(new Date()),
    };
    console.log('🔄 [FILTRO] Definindo período para último ano:', newDateRange);
    setActivePeriod('year');
    setDateRange(newDateRange);
  };

  const setAllData = () => {
    const newDateRange = {
      from: new Date(2020, 0, 1),
      to: new Date()
    };
    console.log('🔄 [FILTRO] Definindo período para todos os dados:', newDateRange);
    setActivePeriod('all');
    setDateRange(newDateRange);
  };

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<CreditApplication[]>({
    queryKey: user?.userType === "admin" ? ["/api/admin/credit-applications"] : ["/api/credit-applications/user"],
    queryFn: async () => {
      const endpoint = user?.userType === "admin" ? "/api/admin/credit-applications" : "/api/credit-applications/user";
      
      console.log('🔍 [REPORTS] === INICIANDO BUSCA DE DADOS ===');
      console.log('🔍 [REPORTS] Endpoint usado:', endpoint);
      console.log('🔍 [REPORTS] Tipo de usuário:', user?.userType);
      console.log('🔍 [REPORTS] Timestamp:', new Date().toISOString());
      
      const response = await apiRequest("GET", endpoint);
      const data = await response.json();
      
      console.log('📊 [REPORTS] Dados recebidos:', {
        isAdmin: user?.userType === "admin",
        dataType: typeof data,
        dataKeys: Object.keys(data || {}),
        dataLength: Array.isArray(data) ? data.length : 'não é array'
      });
      
      // Para administradores, o endpoint retorna um objeto com arrays separados
      if (user?.userType === "admin" && data.new && data.underReview && data.historical) {
        const combined = [...data.new, ...data.underReview, ...data.historical];
        console.log('📊 [REPORTS] Dados combinados (admin):', combined.length);
        return combined;
      }
      
      console.log('📊 [REPORTS] Dados retornados:', Array.isArray(data) ? data.length : 'não é array');
      return data;
    },
    enabled: !!user,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: user?.userType === "admin" ? ["/api/admin/accounts"] : ["/api/accounts/user"],
    queryFn: async () => {
      const endpoint = user?.userType === "admin" ? "/api/admin/accounts" : "/api/accounts/user";
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
    enabled: !!user,
  });

  const { data: allPayments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/reports/payments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/reports/payments");
      return response.json();
    },
    enabled: !!user,
  });

  const isLoading = applicationsLoading || accountsLoading || paymentsLoading;

  // Filtrar dados por período
  const filteredApplications = applications.filter(app => {
    if (!app.createdAt) return false;
    
    // Usar new Date() em vez de parseISO() pois as datas vêm como Date objects da BD
    const appDate = new Date(app.createdAt);
    const isInRange = appDate >= dateRange.from && appDate <= dateRange.to;
    
    // Log de debug para verificar a filtragem
    if (applications.length > 0 && Math.random() < 0.1) { // Log apenas 10% das vezes para não sobrecarregar
      console.log('🔍 [FILTRO] Verificando aplicação:', {
        id: app.id,
        createdAt: app.createdAt,
        appDate: appDate,
        dateRange: dateRange,
        isInRange: isInRange
      });
    }
    
    return isInRange;
  });
  
  // Log do resultado da filtragem
  console.log('📊 [FILTRO] Resultado da filtragem:', {
    totalApplications: applications.length,
    filteredApplications: filteredApplications.length,
    dateRange: dateRange
  });





  const filteredPayments = allPayments.filter(payment => {
    if (!payment.paymentDate) return false;
    
    // Usar new Date() em vez de parseISO() pois as datas vêm como Date objects da BD
    const paymentDate = new Date(payment.paymentDate);
    return paymentDate >= dateRange.from && paymentDate <= dateRange.to;
  });

  // Calcular estatísticas baseadas no tipo de relatório e filtros
  const getDataForReportType = () => {
    switch (reportType) {
      case "applications":
        return filteredApplications;
      case "payments":
        return filteredPayments;
      case "analytics":
        return filteredApplications.filter(app => app.status === "approved");
      default: // overview
        return filteredApplications;
    }
  };
  
  const datasetToUse = getDataForReportType();
  
  // Usar sempre filteredApplications para cálculos de status, independente do tipo de relatório
  const approvedApps = filteredApplications.filter(app => app.status === "approved");
  const rejectedApps = filteredApplications.filter(app => app.status === "rejected");
  const pendingApps = filteredApplications.filter(app => app.status === "pending");
  const underReviewApps = filteredApplications.filter(app => app.status === "under_review");
  
  // 🔍 [DEBUG] Log dos status das aplicações
  console.log('📊 [STATUS DEBUG] === ANÁLISE DE STATUS ===');
  console.log('📊 [STATUS DEBUG] Total de aplicações filtradas:', filteredApplications.length);
  
  // Log detalhado de cada aplicação e seu status
  filteredApplications.forEach((app, index) => {
    console.log(`📊 [STATUS DEBUG] App ${index + 1}:`, {
      id: app.id,
      status: app.status,
      amount: app.amount,
      createdAt: app.createdAt
    });
  });
  
  // Log dos contadores por status
  console.log('📊 [STATUS DEBUG] Contadores por status:', {
    approved: approvedApps.length,
    rejected: rejectedApps.length,
    pending: pendingApps.length,
    underReview: underReviewApps.length,
    total: filteredApplications.length
  });
  
  // Log das aplicações pendentes especificamente (pending + under_review)
  console.log('📊 [STATUS DEBUG] Aplicações pendentes (apenas pending):', pendingApps.map(app => ({
    id: app.id,
    status: app.status,
    createdAt: app.createdAt
  })));
  console.log('📊 [STATUS DEBUG] Aplicações em análise (under_review):', underReviewApps.map(app => ({
    id: app.id,
    status: app.status,
    createdAt: app.createdAt
  })));
  console.log('📊 [STATUS DEBUG] Aplicações separadas por status:', {
    pending: pendingApps.map(app => ({ id: app.id, status: app.status, createdAt: app.createdAt })),
    underReview: underReviewApps.map(app => ({ id: app.id, status: app.status, createdAt: app.createdAt }))
  });
  
  const stats = {
    totalApplications: filteredApplications.length,
    approvedApplications: approvedApps.length,
    rejectedApplications: rejectedApps.length,
    pendingApplications: pendingApps.length,
    totalCreditValue: filteredApplications.reduce((sum, app) => sum + parseFloat(app.amount), 0),
    approvedCreditValue: approvedApps.reduce((sum, app) => sum + parseFloat(app.amount), 0),
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
      
      // Header com logo e informações
      doc.setFontSize(22);
      doc.setTextColor(76, 175, 80); // Verde AgriCredit
      doc.text('AgriCredit - Relatório Financeiro', 20, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, 35);
      doc.text(`Usuário: ${user?.fullName}`, 20, 42);
      doc.text(`Período: ${dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'} - ${dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}`, 20, 49);
      
      // Linha separadora
      doc.setDrawColor(76, 175, 80);
      doc.setLineWidth(0.5);
      doc.line(20, 55, 190, 55);
      
      // Resumo estatístico com melhor formatação
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('📊 Resumo Estatístico', 20, 70);
      
      const summaryData = [
        ['Total de Solicitações', stats.totalApplications.toString()],
        ['Solicitações Aprovadas', stats.approvedApplications.toString()],
        ['Solicitações Rejeitadas', stats.rejectedApplications.toString()],
        ['Solicitações Pendentes', stats.pendingApplications.toString()],
        ['Taxa de Aprovação', `${approvalRate.toFixed(1)}%`],
        ['Valor Total Solicitado (AOA)', formatKwanza(stats.totalCreditValue)],
        ['Valor Total Aprovado (AOA)', formatKwanza(stats.approvedCreditValue)],
        ['Total de Pagamentos (AOA)', formatKwanza(stats.totalPayments)]
      ];

      autoTable(doc, {
        head: [['Métrica', 'Valor']],
        body: summaryData,
        startY: 80,
        theme: 'striped',
        headStyles: { 
          fillColor: [76, 175, 80],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 20, right: 20 }
      });

      // Gráfico de distribuição por status (representação textual)
      const finalY = doc.lastAutoTable?.finalY || 150;
      doc.setFontSize(14);
      doc.text('📈 Distribuição por Estado das Solicitações', 20, finalY + 20);
      
      const statusData = [
        ['Estado', 'Quantidade', 'Percentual', 'Barra Visual'],
        [
          'Aprovadas', 
          stats.approvedApplications.toString(), 
          `${stats.totalApplications > 0 ? (stats.approvedApplications / stats.totalApplications * 100).toFixed(1) : 0}%`,
          '█'.repeat(Math.round((stats.approvedApplications / Math.max(stats.totalApplications, 1)) * 20))
        ],
        [
          'Pendentes', 
          stats.pendingApplications.toString(), 
          `${stats.totalApplications > 0 ? (stats.pendingApplications / stats.totalApplications * 100).toFixed(1) : 0}%`,
          '█'.repeat(Math.round((stats.pendingApplications / Math.max(stats.totalApplications, 1)) * 20))
        ],
        [
          'Rejeitadas', 
          stats.rejectedApplications.toString(), 
          `${stats.totalApplications > 0 ? (stats.rejectedApplications / stats.totalApplications * 100).toFixed(1) : 0}%`,
          '█'.repeat(Math.round((stats.rejectedApplications / Math.max(stats.totalApplications, 1)) * 20))
        ]
      ];

      autoTable(doc, {
         head: [['Estado', 'Quantidade', 'Percentual', 'Barra Visual']],
         body: statusData.slice(1),
         startY: finalY + 30,
         theme: 'grid',
         headStyles: { 
           fillColor: [52, 152, 219],
           textColor: [255, 255, 255],
           fontSize: 10,
           fontStyle: 'bold'
         },
         bodyStyles: {
           fontSize: 9
         },
         columnStyles: {
           3: { fontSize: 8 }
         },
         margin: { left: 20, right: 20 }
       });

      // Distribuição por tipo de projeto
      if (Object.keys(projectDistribution).length > 0) {
        const projectFinalY = doc.lastAutoTable?.finalY || 200;
        
        doc.setFontSize(14);
        doc.text('🌾 Distribuição por Tipo de Projeto', 20, projectFinalY + 20);
        
        const projectData = Object.entries(projectDistribution).map(([type, count]) => {
          const percentage = ((count / stats.totalApplications) * 100).toFixed(1);
          return [
            getProjectTypeLabel(type),
            count.toString(),
            `${percentage}%`,
            '█'.repeat(Math.round((count / Math.max(stats.totalApplications, 1)) * 15))
          ];
        });

        autoTable(doc, {
           head: [['Tipo de Projeto', 'Quantidade', 'Percentual', 'Barra Visual']],
           body: projectData,
           startY: projectFinalY + 30,
           theme: 'grid',
           headStyles: { 
             fillColor: [155, 89, 182],
             textColor: [255, 255, 255],
             fontSize: 10,
             fontStyle: 'bold'
           },
           bodyStyles: {
             fontSize: 9
           },
           columnStyles: {
             3: { fontSize: 8 }
           },
           margin: { left: 20, right: 20 }
         });
      }

      // Solicitações detalhadas em nova página
      if (filteredApplications.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor(76, 175, 80);
        doc.text('📋 Solicitações de Crédito Detalhadas', 20, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total de ${filteredApplications.length} solicitações no período selecionado`, 20, 35);

        const applicationData = filteredApplications.slice(0, 50).map((app: any) => [
          app.projectName && app.projectName.length > 25 ? app.projectName.substring(0, 22) + '...' : (app.projectName || 'N/A'),
          getProjectTypeLabel(app.projectType),
          formatKwanza(parseFloat(app.amount)),
          app.status === 'approved' ? '✅ Aprovada' : 
          app.status === 'rejected' ? '❌ Rejeitada' : 
          app.status === 'pending' ? '⏳ Pendente' : '🔍 Em Análise',
          format(parseISO(app.createdAt!.toString()), 'dd/MM/yyyy', { locale: ptBR }),
          `${app.term || 0} meses`
        ]);

        autoTable(doc, {
          head: [['Projeto', 'Tipo', 'Montante (AOA)', 'Estado', 'Data', 'Prazo']],
          body: applicationData,
          startY: 45,
          theme: 'striped',
          headStyles: { 
            fillColor: [76, 175, 80],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 25 },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 15 }
          },
          margin: { left: 15, right: 15 }
        });
        
        if (filteredApplications.length > 50) {
          const remainingY = doc.lastAutoTable?.finalY || 250;
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(`Nota: Mostrando apenas as primeiras 50 solicitações de ${filteredApplications.length} total.`, 20, remainingY + 10);
        }
      }

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`AgriCredit © ${new Date().getFullYear()} - Página ${i} de ${pageCount}`, 20, 285);
        doc.text(`Relatório gerado automaticamente em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 120, 285);
      }

      // Save PDF
      doc.save(`relatorio-agricredit-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast.success("PDF exportado com sucesso! O relatório foi baixado com gráficos e estatísticas detalhadas.");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Erro ao exportar PDF. Não foi possível gerar o relatório PDF.");
    }
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Informações do relatório
      const infoData = [
        ['AgriCredit - Relatório Financeiro'],
        [''],
        ['Gerado em:', format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })],
        ['Usuário:', user?.fullName || 'N/A'],
        ['Período:', `${dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'} - ${dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}`],
        [''],
        ['RESUMO ESTATÍSTICO'],
        ['Métrica', 'Valor'],
        ['Total de Solicitações', stats.totalApplications],
        ['Solicitações Aprovadas', stats.approvedApplications],
        ['Solicitações Rejeitadas', stats.rejectedApplications],
        ['Solicitações Pendentes', stats.pendingApplications],
        ['Taxa de Aprovação (%)', parseFloat(approvalRate.toFixed(1))],
        ['Valor Total Solicitado (AOA)', formatKwanza(stats.totalCreditValue)],
        ['Valor Total Aprovado (AOA)', formatKwanza(stats.approvedCreditValue)],
        ['Total de Pagamentos (AOA)', formatKwanza(stats.totalPayments)]
      ];

      const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
      
      // Formatação da planilha de resumo
      const range = XLSX.utils.decode_range(infoSheet['!ref'] || 'A1');
      
      // Título principal
      if (infoSheet['A1']) {
        infoSheet['A1'].s = {
          font: { bold: true, sz: 16, color: { rgb: "4CAF50" } },
          alignment: { horizontal: 'center' }
        };
      }
      
      // Cabeçalho da seção
      if (infoSheet['A7']) {
        infoSheet['A7'].s = {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "E8F5E8" } }
        };
      }
      
      XLSX.utils.book_append_sheet(workbook, infoSheet, 'Resumo');

      // Solicitações detalhadas
      if (filteredApplications.length > 0) {
        const applicationData = [
          ['Projeto', 'Tipo', 'Montante (AOA)', 'Montante Formatado', 'Estado', 'Data', 'Prazo (meses)', 'Observações']
        ];
        
        filteredApplications.forEach((app: any) => {
          applicationData.push([
            app.projectName || 'N/A',
            getProjectTypeLabel(app.projectType),
            parseFloat(app.amount), // Valor numérico para cálculos
            formatKwanza(parseFloat(app.amount)), // Valor formatado para visualização
            app.status === 'approved' ? 'Aprovada' : 
            app.status === 'rejected' ? 'Rejeitada' : 
            app.status === 'pending' ? 'Pendente' : 'Em Análise',
            format(parseISO(app.createdAt!.toString()), 'dd/MM/yyyy', { locale: ptBR }),
            app.term || 0,
            app.status === 'approved' ? 'Crédito aprovado e disponível' :
            app.status === 'rejected' ? 'Solicitação não atende aos critérios' :
            app.status === 'pending' ? 'Aguardando análise' : 'Em processo de avaliação'
          ]);
        });

        const applicationsSheet = XLSX.utils.aoa_to_sheet(applicationData);
        
        // Adicionar totais no final
        const totalRow = applicationData.length + 2;
        applicationData.push(
          [''],
          ['TOTAIS:', '', '', '', '', '', '', ''],
          ['Total Geral:', '', filteredApplications.reduce((sum, app) => sum + parseFloat(app.amount), 0).toString(), formatKwanza(filteredApplications.reduce((sum, app) => sum + parseFloat(app.amount), 0)), '', '', '', '']
        );
        
        const finalApplicationsSheet = XLSX.utils.aoa_to_sheet(applicationData);
        XLSX.utils.book_append_sheet(workbook, finalApplicationsSheet, 'Solicitações');
      }

      // Distribuição por estado
      const statusDistributionData = [
        ['DISTRIBUIÇÃO POR ESTADO'],
        [''],
        ['Estado', 'Quantidade', 'Percentual', 'Valor Total (AOA)', 'Valor Formatado'],
        [
          'Aprovadas',
          stats.approvedApplications,
          `${stats.totalApplications > 0 ? (stats.approvedApplications / stats.totalApplications * 100).toFixed(1) : 0}%`,
          stats.approvedCreditValue,
          formatKwanza(stats.approvedCreditValue)
        ],
        [
          'Pendentes',
          stats.pendingApplications,
          `${stats.totalApplications > 0 ? (stats.pendingApplications / stats.totalApplications * 100).toFixed(1) : 0}%`,
          0, // Valor pendente não é contabilizado
          'AOA 0,00'
        ],
        [
          'Rejeitadas',
          stats.rejectedApplications,
          `${stats.totalApplications > 0 ? (stats.rejectedApplications / stats.totalApplications * 100).toFixed(1) : 0}%`,
          0, // Valor rejeitado não é contabilizado
          'AOA 0,00'
        ]
      ];

      const statusSheet = XLSX.utils.aoa_to_sheet(statusDistributionData);
      XLSX.utils.book_append_sheet(workbook, statusSheet, 'Distribuição Estado');

      // Distribuição por tipo de projeto
      if (Object.keys(projectDistribution).length > 0) {
        const distributionData = [
          ['DISTRIBUIÇÃO POR TIPO DE PROJETO'],
          [''],
          ['Tipo de Projeto', 'Quantidade', 'Percentual', 'Valor Médio (AOA)']
        ];
        
        Object.entries(projectDistribution).forEach(([type, count]) => {
          const countNum = Number(count);
          const percentage = ((countNum / stats.totalApplications) * 100).toFixed(1);
          const typeApplications = filteredApplications.filter((app: any) => app.projectType === type);
          const avgValue = typeApplications.length > 0 
            ? typeApplications.reduce((sum: number, app: any) => sum + parseFloat(app.amount), 0) / typeApplications.length
            : 0;
          
          distributionData.push([
            getProjectTypeLabel(type),
            String(countNum),
            `${percentage}%`,
            formatKwanza(avgValue)
          ]);
        });

        const distributionSheet = XLSX.utils.aoa_to_sheet(distributionData);
        XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Distribuição Projetos');
      }

      // Análise financeira
      const financialData = [
        ['ANÁLISE FINANCEIRA DETALHADA'],
        [''],
        ['Métrica', 'Valor (AOA)', 'Valor Formatado', 'Observações'],
        ['Valor Total Solicitado', stats.totalCreditValue, formatKwanza(stats.totalCreditValue), 'Soma de todas as solicitações'],
        ['Valor Total Aprovado', stats.approvedCreditValue, formatKwanza(stats.approvedCreditValue), 'Soma dos créditos aprovados'],
        ['Valor Total Rejeitado', stats.totalCreditValue - stats.approvedCreditValue, formatKwanza(stats.totalCreditValue - stats.approvedCreditValue), 'Valor das solicitações rejeitadas'],
        ['Total de Pagamentos', stats.totalPayments, formatKwanza(stats.totalPayments), 'Pagamentos recebidos'],
        ['Saldo Devedor', stats.approvedCreditValue - stats.totalPayments, formatKwanza(stats.approvedCreditValue - stats.totalPayments), 'Valor ainda em aberto'],
        ['Taxa de Recuperação', stats.approvedCreditValue > 0 ? ((stats.totalPayments / stats.approvedCreditValue) * 100).toFixed(2) + '%' : '0%', '', 'Percentual de pagamentos vs aprovado']
      ];

      const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
      XLSX.utils.book_append_sheet(workbook, financialSheet, 'Análise Financeira');

      // Generate and save Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `relatorio-agricredit-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast.success("Excel exportado com sucesso! O relatório foi baixado com múltiplas planilhas e análises detalhadas.");
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error("Erro ao exportar Excel. Não foi possível gerar o relatório Excel.");
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
                className="text-white hover:bg-agri-dark hover:text-white"
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
                    <SelectItem value="analytics">Análise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Período</label>
                <div className="flex space-x-2">
                  <Button
                    variant={activePeriod === '3months' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod(3)}
                  >
                    Últimos 3 meses
                  </Button>
                  <Button
                    variant={activePeriod === '6months' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod(6)}
                  >
                    Últimos 6 meses
                  </Button>
                  <Button
                    variant={activePeriod === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLastYear()}
                  >
                    Último ano
                  </Button>
                  <Button
                    variant={activePeriod === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAllData()}
                  >
                    Todos os dados
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
            {/* Renderização condicional baseada no tipo de relatório */}
            {reportType === "overview" && (
              <>
                {/* Overview Stats */}
                <div className="grid md:grid-cols-5 gap-6 mb-8">
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
                          <p className="text-gray-600 text-sm font-medium">Aprovadas</p>
                          <p className="text-2xl font-bold text-agri-dark">{stats.approvedApplications}</p>
                        </div>
                        <TrendingUp className="text-green-500 w-8 h-8" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Pendentes</p>
                          <p className="text-2xl font-bold text-agri-dark">{stats.pendingApplications}</p>
                        </div>
                        <Calendar className="text-yellow-500 w-8 h-8" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-orange-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Em Análise</p>
                          <p className="text-2xl font-bold text-agri-dark">{underReviewApps.length}</p>
                        </div>
                        <BarChart3 className="text-orange-500 w-8 h-8" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-green-600">
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
                            <span className="text-sm font-medium">Em Análise</span>
                            <span className="text-sm text-gray-600">
                              {underReviewApps.length} ({stats.totalApplications > 0 ? (underReviewApps.length / stats.totalApplications * 100).toFixed(1) : 0}%)
                            </span>
                          </div>
                          <Progress 
                            value={stats.totalApplications > 0 ? (underReviewApps.length / stats.totalApplications) * 100 : 0} 
                            className="h-2 bg-orange-100"
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
              </>
            )}

            {/* Seção de Aplicações */}
            {reportType === "applications" && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Relatório de Aplicações de Crédito</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
                      <p className="text-sm text-gray-600">Total de Aplicações</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{stats.approvedApplications}</p>
                      <p className="text-sm text-gray-600">Aprovadas</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p>
                      <p className="text-sm text-gray-600">Pendentes</p>
                    </div>
                  </div>
                  {filteredApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhuma aplicação encontrada no período selecionado.</p>
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
                          {filteredApplications.map((application) => (
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
                                  application.status === "under_review" ? "bg-orange-100 text-orange-800" :
                                  "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {application.status === "approved" ? "Aprovado" :
                                   application.status === "rejected" ? "Rejeitado" :
                                   application.status === "under_review" ? "Em Análise" : "Pendente"}
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
            )}

            {/* Seção de Pagamentos */}
            {reportType === "payments" && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Relatório de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{formatKwanza(stats.totalPayments)}</p>
                      <p className="text-sm text-gray-600">Total Recebido</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{formatKwanza(stats.approvedCreditValue)}</p>
                      <p className="text-sm text-gray-600">Total Aprovado</p>
                    </div>
                  </div>
                  {filteredApplications.filter(app => app.status === 'approved').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhum pagamento encontrado no período selecionado.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Projeto</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Valor Aprovado</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredApplications.filter(app => app.status === 'approved').map((application) => (
                            <tr key={application.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {application.createdAt ? format(new Date(application.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                              </td>
                              <td className="py-3 px-4 font-medium text-agri-dark">
                                {application.projectName}
                              </td>
                              <td className="py-3 px-4 font-semibold text-agri-dark">
                                {formatKwanza(parseFloat(application.amount))}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Aprovado
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
            )}

            {/* Seção de Análise */}
            {reportType === "analytics" && (
              <div className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Análise Detalhada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-4">Métricas de Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Taxa de Aprovação:</span>
                            <span className="font-semibold">{approvalRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor Médio por Empréstimo:</span>
                            <span className="font-semibold">{formatKwanza(stats.averageLoanSize)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total de Aplicações:</span>
                            <span className="font-semibold">{stats.totalApplications}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Distribuição por Tipo</h4>
                        <div className="space-y-3">
                          {Object.entries(projectDistribution).map(([type, count]) => (
                            <div key={type} className="flex justify-between">
                              <span>{getProjectTypeLabel(type)}:</span>
                              <span className="font-semibold">{count} ({stats.totalApplications > 0 ? (count / stats.totalApplications * 100).toFixed(1) : 0}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabela de Solicitações Recentes - apenas para overview */}
            {reportType === "overview" && (
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
                                  application.status === "under_review" ? "bg-orange-100 text-orange-800" :
                                  "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {application.status === "approved" ? "Aprovado" :
                                   application.status === "rejected" ? "Rejeitado" :
                                   application.status === "under_review" ? "Em Análise" : "Pendente"}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}