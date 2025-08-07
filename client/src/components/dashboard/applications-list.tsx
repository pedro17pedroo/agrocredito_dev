import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKwanza, getProjectTypeLabel, getStatusLabel } from "@/lib/angola-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { PermissionGate } from "@/components/PermissionGate";
import type { CreditApplication } from "@shared/schema";

interface ApplicationsListProps {
  applications: CreditApplication[];
  isLoading: boolean;
}

export default function ApplicationsList({ applications, isLoading }: ApplicationsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Solicitações de Crédito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Solicitações de Crédito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Ainda não tem solicitações de crédito.</p>
            <PermissionGate permission="applications.create">
              <Link href="/credit-application">
                <Button className="bg-agri-primary hover:bg-agri-dark">
                  Fazer primeira solicitação
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-agri-dark">
          Minhas Solicitações de Crédito
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Projeto</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Montante</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Data</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((application) => {
                const status = getStatusLabel(application.status || 'pending');
                
                return (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-agri-dark">{application.projectName}</div>
                      <div className="text-sm text-gray-600">
                        {getProjectTypeLabel(application.projectType)}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-agri-dark">
                      {formatKwanza(application.amount)}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {application.createdAt ? format(new Date(application.createdAt), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/application/${application.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-agri-primary hover:text-agri-dark font-medium"
                        >
                          Ver Detalhes
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
