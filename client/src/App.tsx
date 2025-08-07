import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/use-auth";
import { PermissionGate } from "@/components/PermissionGate";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import FinancialInstitutionDashboard from "@/pages/financial-institution-dashboard";
import CreditApplication from "@/pages/credit-application";
import ApplicationDetails from "@/pages/application-details";
import Simulator from "@/pages/simulator";
import Reports from "@/pages/reports";
import ProfileManagement from "@/pages/profile-management";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/simulator" component={Simulator} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      
      {/* Admin routes - accessible for both logged in and not logged in users */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/financial-dashboard" component={FinancialInstitutionDashboard} />
      
      {/* Root route always shows landing page */}
      <Route path="/" component={Landing} />
      
      {/* Protected routes - only accessible when authenticated */}
      {user && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/credit-application">
            <PermissionGate permission="applications.create" fallback={<NotFound />}>
              <CreditApplication />
            </PermissionGate>
          </Route>
          <Route path="/application/:id">
            <PermissionGate permission="applications.read" fallback={<NotFound />}>
              <ApplicationDetails />
            </PermissionGate>
          </Route>
          <Route path="/reports">
            <PermissionGate permission="reports.read" fallback={<NotFound />}>
              <Reports />
            </PermissionGate>
          </Route>
          <Route path="/profile-management">
            <PermissionGate permission="admin.profiles" fallback={<NotFound />}>
              <ProfileManagement />
            </PermissionGate>
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
