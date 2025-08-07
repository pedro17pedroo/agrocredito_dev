import { CreditCard, Calendar, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKwanza } from "@/lib/angola-utils";
import type { CreditApplication, Account } from "@shared/schema";

interface StatsCardsProps {
  applications: CreditApplication[];
  accounts: Account[];
  isLoading: boolean;
}

export default function StatsCards({ applications, accounts, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalOutstanding = accounts.reduce((sum, account) => 
    sum + parseFloat(account.outstandingBalance || "0"), 0
  );

  const nextPayment = accounts.find(account => account.nextPaymentDate);
  const nextPaymentAmount = nextPayment ? parseFloat(nextPayment.monthlyPayment || "0") : 0;

  const activeApplications = applications.filter(app => app.status === "pending").length;
  const approvedApplications = applications.filter(app => app.status === "approved").length;
  const approvalRate = applications.length > 0 ? 
    Math.round((approvedApplications / applications.length) * 100) : 0;

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card className="border-l-4 border-agri-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Saldo Devedor</p>
              <p className="text-2xl font-bold text-agri-dark">
                {formatKwanza(totalOutstanding)}
              </p>
            </div>
            <CreditCard className="text-agri-primary w-8 h-8" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-agri-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Próxima Prestação</p>
              <p className="text-2xl font-bold text-agri-dark">
                {formatKwanza(nextPaymentAmount)}
              </p>
            </div>
            <Calendar className="text-agri-secondary w-8 h-8" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-orange-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Solicitações Ativas</p>
              <p className="text-2xl font-bold text-agri-dark">{activeApplications}</p>
            </div>
            <FileText className="text-orange-500 w-8 h-8" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Taxa de Aprovação</p>
              <p className="text-2xl font-bold text-agri-dark">{approvalRate}%</p>
            </div>
            <TrendingUp className="text-green-500 w-8 h-8" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
