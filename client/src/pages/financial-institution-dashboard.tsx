import { useState } from "react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  FileText,
  Menu,
  X as CloseIcon
} from "lucide-react";
import CreditApplicationsView from "@/components/financial/credit-applications-view";
import CreditProgramManagement from "@/components/credit/credit-program-management";
import FinancialReports from "@/components/financial/financial-reports";
import UserManagement from "@/components/financial/user-management";

type ViewType = 'applications' | 'programs' | 'users' | 'reports';

const sidebarItems = [
  {
    id: 'applications' as ViewType,
    label: 'Solicitações de Crédito',
    icon: FileText,
    description: 'Gerir solicitações e aprovações'
  },
  {
    id: 'programs' as ViewType,
    label: 'Programas de Crédito',
    icon: Settings,
    description: 'Configurar programas e taxas'
  },
  {
    id: 'users' as ViewType,
    label: 'Gestão de Utilizadores',
    icon: Users,
    description: 'Gerir clientes e equipa'
  },
  {
    id: 'reports' as ViewType,
    label: 'Relatórios',
    icon: BarChart3,
    description: 'Análises e estatísticas'
  }
];

export default function FinancialInstitutionDashboard() {
  const { user } = useAuth();
  const logout = useLogout();
  const [currentView, setCurrentView] = useState<ViewType>('applications');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.userType !== "financial_institution") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Esta página é apenas para instituições financeiras.</p>
          <Button onClick={() => logout.mutate()}>
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout.mutate();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'applications':
        return <CreditApplicationsView />;
      case 'programs':
        return <CreditProgramManagement />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <FinancialReports />;
      default:
        return <CreditApplicationsView />;
    }
  };

  const currentItem = sidebarItems.find(item => item.id === currentView);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-agri-primary" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Instituição</h1>
                <p className="text-sm text-gray-600">Financeira</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <CloseIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-agri-light text-agri-dark border-r-4 border-agri-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-agri-primary' : ''}`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-agri-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Instituição Financeira
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center justify-center"
              disabled={logout.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Terminar Sessão
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentItem?.label}
                </h1>
                <p className="text-gray-600 text-sm">
                  {currentItem?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bem-vindo, {user.fullName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}