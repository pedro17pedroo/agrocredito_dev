import { useAuth, useLogout } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Sprout, Plus, Calculator, Download, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { PermissionGate } from "@/components/PermissionGate";
import StatsCards from "@/components/dashboard/stats-cards";
import ApplicationsList from "@/components/dashboard/applications-list";
import NotificationCenter from "@/components/notifications/notification-center";
import { formatKwanza } from "@/lib/angola-utils";
import type { CreditApplication, Account } from "@shared/schema";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const logout = useLogout();
  const [, setLocation] = useLocation();

  // Redirect financial institutions to their specialized dashboard
  useEffect(() => {
    if (user && user.userType === "financial_institution") {
      setLocation("/financial-dashboard");
    }
  }, [user, setLocation]);

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<CreditApplication[]>({
    queryKey: ["/api/credit-applications/user"],
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts/user"],
  });

  const handleLogout = () => {
    logout.mutate();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <nav className="bg-agri-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sprout className="w-8 h-8 mr-3" />
              <span className="text-xl font-bold">Painel AgroCrédito</span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <span className="hidden sm:block">{user.fullName}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="bg-agri-dark hover:bg-opacity-80"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-agri-dark mb-2">
            Bem-vindo, {user.fullName.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 text-lg">Gerir os seus créditos agrícolas nunca foi tão fácil</p>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          applications={applications}
          accounts={accounts}
          isLoading={applicationsLoading || accountsLoading}
        />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <PermissionGate permission="applications.create">
            <Link href="/credit-application">
              <Button className="w-full bg-agri-primary text-white p-6 rounded-xl hover:bg-agri-dark transition-colors text-left group h-auto">
                <div className="flex flex-col items-start">
                  <Plus className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2 text-left">Nova Solicitação</h3>
                  <p className="text-agri-light text-left">Solicite um novo crédito para o seu projeto agrícola</p>
                </div>
              </Button>
            </Link>
          </PermissionGate>

          <Link href="/simulator">
            <Button 
              variant="outline" 
              className="w-full border-2 border-agri-primary text-agri-primary p-6 rounded-xl hover:bg-agri-primary hover:text-white transition-colors text-left group h-auto"
            >
              <div className="flex flex-col items-start">
                <Calculator className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2 text-left">Simular Crédito</h3>
                <p className="opacity-80 text-left">Calcule as condições do seu próximo financiamento</p>
              </div>
            </Button>
          </Link>

          <PermissionGate permission="reports.read">
            <Link href="/reports">
              <Button 
                variant="outline"
                className="w-full border-2 border-agri-secondary text-agri-secondary p-6 rounded-xl hover:bg-agri-secondary hover:text-white transition-colors text-left group h-auto"
              >
                <div className="flex flex-col items-start">
                  <Download className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2 text-left">Relatórios</h3>
                  <p className="opacity-80 text-left">Descarregue os seus relatórios financeiros</p>
                </div>
              </Button>
            </Link>
          </PermissionGate>
        </div>

        {/* Applications List */}
        <ApplicationsList 
          applications={applications}
          isLoading={applicationsLoading}
        />
      </div>
    </div>
  );
}
