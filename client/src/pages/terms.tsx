import { ArrowLeft, Shield, AlertTriangle, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function Terms() {
  const [, setLocation] = useLocation();
  
  // Check if user is logged in without using the auth hook to avoid loading issues
  const isLoggedIn = !!localStorage.getItem("auth_token");

  const handleBack = () => {
    if (isLoggedIn) {
      setLocation("/dashboard");
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoggedIn && <Navbar />}
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-agri-dark">Termos de Serviço</h1>
              <p className="text-gray-600">Última actualização: Janeiro 2024</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-agri-dark flex items-center">
                  <FileText className="w-6 h-6 mr-2" />
                  1. Aceitação dos Termos
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Ao utilizar a plataforma AgroCrédito, você concorda com estes Termos de Serviço. 
                  Se não concordar com qualquer parte destes termos, não deve utilizar os nossos serviços.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  O AgroCrédito é uma plataforma digital que facilita a conexão entre agricultores 
                  angolanos e instituições financeiras para facilitar o acesso ao crédito agrícola.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-agri-dark flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  2. Elegibilidade e Registo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <h4 className="font-semibold text-agri-dark">2.1 Requisitos de Elegibilidade</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ter pelo menos 18 anos de idade</li>
                    <li>Ser residente em Angola</li>
                    <li>Possuir Bilhete de Identidade válido</li>
                    <li>Ter número de telemóvel angolano activo</li>
                    <li>Estar envolvido em actividades agrícolas</li>
                  </ul>
                  
                  <h4 className="font-semibold text-agri-dark mt-6">2.2 Veracidade das Informações</h4>
                  <p>
                    Você compromete-se a fornecer informações verdadeiras, exactas e completas durante 
                    o registo e manter estes dados actualizados. Informações falsas podem resultar 
                    na suspensão ou cancelamento da conta.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-agri-dark flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  3. Uso da Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <h4 className="font-semibold text-agri-dark">3.1 Uso Permitido</h4>
                  <p>
                    A plataforma deve ser utilizada exclusivamente para fins relacionados com 
                    crédito agrícola. É permitido:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Simular condições de crédito</li>
                    <li>Submeter solicitações de crédito</li>
                    <li>Gerir contas e pagamentos aprovados</li>
                    <li>Aceder a relatórios e histórico</li>
                  </ul>
                  
                  <h4 className="font-semibold text-agri-dark mt-6">3.2 Uso Proibido</h4>
                  <p>É estritamente proibido:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Usar a plataforma para actividades fraudulentas</li>
                    <li>Tentar aceder a contas de outros utilizadores</li>
                    <li>Interferir com o funcionamento da plataforma</li>
                    <li>Usar informações falsas ou enganosas</li>
                    <li>Violar as leis angolanas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-agri-dark">
                  4. Crédito e Condições Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <h4 className="font-semibold text-agri-dark">4.1 Processo de Aprovação</h4>
                  <p>
                    A aprovação de crédito está sujeita à análise das instituições financeiras parceiras. 
                    O AgroCrédito facilita o processo mas não garante aprovação.
                  </p>
                  
                  <h4 className="font-semibold text-agri-dark">4.2 Taxas e Condições</h4>
                  <p>
                    As taxas de juro e condições são definidas pelas instituições financeiras e 
                    podem variar entre 13% e 18% ao ano, dependendo do projeto e perfil do agricultor.
                  </p>
                  
                  <h4 className="font-semibold text-agri-dark">4.3 Responsabilidades de Pagamento</h4>
                  <p>
                    O utilizador é responsável pelo cumprimento dos pagamentos conforme acordado. 
                    Atrasos podem resultar em juros adicionais e afectar o historial de crédito.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-agri-dark">
                  5. Privacidade e Protecção de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Os seus dados pessoais são protegidos conforme a nossa Política de Privacidade. 
                    Utilizamos criptografia de nível bancário e cumprimos as normas angolanas de 
                    protecção de dados.
                  </p>
                  <p>
                    Os dados podem ser partilhados com instituições financeiras parceiras apenas 
                    para fins de análise de crédito e com o seu consentimento explícito.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-agri-dark flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  6. Limitação de Responsabilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <p>
                    O AgroCrédito actua como intermediário entre agricultores e instituições financeiras. 
                    Não somos responsáveis por:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Decisões de aprovação ou rejeição de crédito</li>
                    <li>Taxas e condições estabelecidas pelas instituições financeiras</li>
                    <li>Problemas decorrentes do uso inadequado dos fundos</li>
                    <li>Perdas resultantes de factores externos (clima, mercado, etc.)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-agri-dark">
                  7. Modificações dos Termos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                    As alterações serão comunicadas através da plataforma e por telemóvel/email.
                  </p>
                  <p>
                    A continuação do uso da plataforma após as modificações constitui aceitação 
                    dos novos termos.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-agri-dark">
                  8. Lei Aplicável e Jurisdição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Estes termos são regidos pelas leis da República de Angola. 
                    Qualquer disputa será resolvida nos tribunais competentes de Luanda, Angola.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-agri-dark">
                  9. Contacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Para questões sobre estes Termos de Serviço, entre em contacto:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Email: legal@agricredito.ao</li>
                    <li>Telefone: +244 923 456 789</li>
                    <li>Endereço: Luanda, Angola</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Card className="bg-agri-light border-agri-primary">
              <CardContent className="p-6">
                <p className="text-gray-700">
                  Ao utilizar o AgroCrédito, você confirma que leu, compreendeu e aceita 
                  estes Termos de Serviço na sua totalidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {!isLoggedIn && <Footer />}
    </div>
  );
}