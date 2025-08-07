import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Calendar, CreditCard, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatKwanza } from "@/lib/angola-utils";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Account, Payment } from "@shared/schema";

interface AccountDetailsProps {
  accountId: string;
}

export default function AccountDetails({ accountId }: AccountDetailsProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentAmount, setPaymentAmount] = useState("");

  const { data: account, isLoading: accountLoading } = useQuery<Account>({
    queryKey: ["/api/accounts", accountId],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/accounts", accountId, "payments"],
  });

  const makePayment = useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiRequest("POST", `/api/accounts/${accountId}/payments`, {
        amount: amount,
        paymentDate: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pagamento registado com sucesso!",
        description: "O saldo da sua conta foi atualizado.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", accountId] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", accountId, "payments"] });
      setPaymentAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Montante inválido",
        description: "Por favor, insira um montante válido.",
        variant: "destructive",
      });
      return;
    }
    makePayment.mutate(paymentAmount);
  };

  const generateStatement = () => {
    // Funcionalidade para gerar extrato em PDF
    toast({
      title: "Extrato em preparação",
      description: "O seu extrato será gerado em breve.",
    });
  };

  if (!user) return null;

  if (accountLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-primary"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Conta não encontrada</h1>
          <Button onClick={() => setLocation("/dashboard")} className="bg-agri-primary hover:bg-agri-dark">
            Voltar ao Painel
          </Button>
        </div>
      </div>
    );
  }

  const outstandingBalance = parseFloat(account.outstandingBalance);
  const totalAmount = parseFloat(account.totalAmount);
  const paidAmount = totalAmount - outstandingBalance;
  const progressPercentage = (paidAmount / totalAmount) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-agri-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-white hover:bg-agri-dark mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Detalhes da Conta</h1>
                <p className="text-agri-secondary">Conta #{account.id.slice(-6)}</p>
              </div>
            </div>
            <Button
              onClick={generateStatement}
              variant="secondary"
              className="bg-agri-dark hover:bg-opacity-80"
            >
              <Download className="w-4 h-4 mr-2" />
              Extrato PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-agri-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Saldo Devedor</p>
                  <p className="text-2xl font-bold text-agri-dark">
                    {formatKwanza(outstandingBalance)}
                  </p>
                </div>
                <CreditCard className="text-agri-primary w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Valor Pago</p>
                  <p className="text-2xl font-bold text-agri-dark">
                    {formatKwanza(paidAmount)}
                  </p>
                </div>
                <DollarSign className="text-green-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-agri-secondary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Próxima Prestação</p>
                  <p className="text-2xl font-bold text-agri-dark">
                    {formatKwanza(parseFloat(account.monthlyPayment))}
                  </p>
                  <p className="text-sm text-gray-600">
                    {account.nextPaymentDate ? format(new Date(account.nextPaymentDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                  </p>
                </div>
                <Calendar className="text-agri-secondary w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-agri-dark">Progresso do Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso do Empréstimo</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total do Empréstimo</p>
                  <p className="font-semibold">{formatKwanza(totalAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Pago</p>
                  <p className="font-semibold text-green-600">{formatKwanza(paidAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Restante</p>
                  <p className="font-semibold text-red-600">{formatKwanza(outstandingBalance)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-agri-dark">Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agri-primary mx-auto"></div>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Nenhum pagamento registado ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-agri-dark">{formatKwanza(parseFloat(payment.amount))}</p>
                        <p className="text-sm text-gray-600">
                          {payment.paymentDate ? format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Pago
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Make Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-agri-dark">Fazer Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paymentAmount">Montante do Pagamento</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Introduza o montante"
                    className="mt-1"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Sugestões de Pagamento:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentAmount(account.monthlyPayment)}
                    >
                      Prestação Mensal ({formatKwanza(parseFloat(account.monthlyPayment))})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentAmount(account.outstandingBalance)}
                    >
                      Liquidar Conta ({formatKwanza(outstandingBalance)})
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={makePayment.isPending || !paymentAmount}
                  className="w-full bg-agri-primary hover:bg-agri-dark"
                >
                  {makePayment.isPending ? "A processar..." : "Efectuar Pagamento"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}