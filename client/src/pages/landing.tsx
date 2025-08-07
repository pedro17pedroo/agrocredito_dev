import { useState } from "react";
import { Link } from "wouter";
import { Sprout, Calculator, Shield, Clock, Smartphone, UserPlus, FileText, CheckCircle, CreditCard, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import SimulatorForm from "@/components/credit/simulator-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const scrollToSimulator = () => {
    document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={() => setShowRegister(true)}
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-agri-light to-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-r from-green-200 to-green-100"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-agri-dark mb-6 leading-tight">
                Democratizar o Acesso ao 
                <span className="text-agri-primary"> Crédito Agrícola</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Conectamos agricultores e empresas agrícolas a instituições financeiras em Angola. 
                Processo rápido, seguro e personalizado para o seu projeto agrícola.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => setShowRegister(true)}
                  className="btn-large btn-primary"
                >
                  <Sprout className="w-5 h-5 mr-2" />
                  Solicitar Crédito Agora
                </Button>
                <Button 
                  variant="outline"
                  onClick={scrollToSimulator}
                  className="btn-large btn-secondary"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Simular Financiamento
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <Sprout className="w-16 h-16 text-agri-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-agri-dark mb-4">Plataforma 100% Digital</h3>
                <p className="text-gray-600 mb-6">Interface simples e segura para agricultores angolanos</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-agri-light p-3 rounded-lg">
                    <div className="text-2xl font-bold text-agri-primary">1000+</div>
                    <div className="text-gray-600">Agricultores</div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <div className="text-gray-600">Taxa Aprovação</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-agri-dark mb-4">
              Como o AgroCrédito Transforma o Seu Negócio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma digital 100% online que conecta agricultores a instituições financeiras de forma simples e segura.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="bg-agri-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Smartphone className="text-agri-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-agri-dark mb-4">Acesso Fácil</h3>
              <p className="text-gray-600 text-lg">
                Interface simples pensada para utilizadores com baixa literacia digital. 
                Botões grandes e poucos cliques.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="bg-agri-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Clock className="text-agri-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-agri-dark mb-4">Processo Rápido</h3>
              <p className="text-gray-600 text-lg">
                Solicitação e aprovação de crédito em minutos. 
                Análise automatizada e resposta imediata.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="bg-agri-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Shield className="text-agri-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-agri-dark mb-4">100% Seguro</h3>
              <p className="text-gray-600 text-lg">
                Dados protegidos com criptografia avançada. 
                Autenticação robusta e transações seguras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-agri-dark mb-4">
              Como Funciona o AgroCrédito
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Em 4 passos simples, obtém o crédito para o seu projeto agrícola. 
              Processo 100% digital e pensado para agricultores angolanos.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="relative">
                <div className="bg-agri-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <UserPlus className="text-white w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 bg-agri-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-agri-dark mb-3">Registar-se</h3>
              <p className="text-gray-600 leading-relaxed">
                Crie a sua conta com o seu BI, telemóvel e dados básicos. 
                Processo rápido e seguro.
              </p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="bg-agri-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Calculator className="text-white w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 bg-agri-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-agri-dark mb-3">Simular</h3>
              <p className="text-gray-600 leading-relaxed">
                Use o simulador para calcular prestações, juros e 
                encontrar as melhores condições.
              </p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="bg-agri-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FileText className="text-white w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 bg-agri-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-agri-dark mb-3">Solicitar</h3>
              <p className="text-gray-600 leading-relaxed">
                Preencha o formulário com detalhes do seu projeto agrícola. 
                Análise automática e rápida.
              </p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="bg-agri-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircle className="text-white w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 bg-agri-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  4
                </div>
              </div>
              <h3 className="text-xl font-bold text-agri-dark mb-3">Receber</h3>
              <p className="text-gray-600 leading-relaxed">
                Receba resposta em minutos. Se aprovado, 
                gerencie tudo no seu painel pessoal.
              </p>
            </div>
          </div>

          {/* Detailed Process Flow */}
          <div className="bg-gradient-to-r from-agri-light to-green-50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-agri-dark mb-4">
                Processo Detalhado
              </h3>
              <p className="text-lg text-gray-700">
                Conheça cada etapa do processo de solicitação de crédito
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-agri-primary rounded-lg p-4">
                    <UserPlus className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-agri-dark mb-2">1. Registo Simples</h4>
                  <p className="text-gray-700 mb-3">
                    Crie a sua conta fornecendo informações básicas como nome completo, BI, 
                    número de telemóvel angolano e email (opcional). Escolha se é agricultor individual, 
                    empresa agrícola, cooperativa ou instituição financeira.
                  </p>
                  <div className="text-sm text-agri-dark font-medium">
                    ⏱️ Tempo estimado: 3-5 minutos
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-agri-secondary rounded-lg p-4">
                    <Calculator className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-agri-dark mb-2">2. Simulação Personalizada</h4>
                  <p className="text-gray-700 mb-3">
                    Use o nosso simulador avançado para calcular prestações mensais, total de juros 
                    e condições de pagamento. As taxas variam conforme o tipo de projeto agrícola 
                    (milho, mandioca, gado, avicultura, horticultura).
                  </p>
                  <div className="text-sm text-agri-dark font-medium">
                    💰 Montantes de AOA 500.000 a AOA 50.000.000
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-orange-500 rounded-lg p-4">
                    <FileText className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-agri-dark mb-2">3. Solicitação Detalhada</h4>
                  <p className="text-gray-700 mb-3">
                    Preencha o formulário com informações sobre o seu projeto: nome, tipo de cultivo/criação, 
                    descrição detalhada, montante necessário e prazo pretendido. 
                    Sistema faz análise automática baseada no seu perfil.
                  </p>
                  <div className="text-sm text-agri-dark font-medium">
                    📋 Análise automática em tempo real
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-green-600 rounded-lg p-4">
                    <CreditCard className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-agri-dark mb-2">4. Gestão e Pagamentos</h4>
                  <p className="text-gray-700 mb-3">
                    Após aprovação, aceda ao seu painel pessoal para acompanhar saldos devedores, 
                    próximas prestações, histórico de pagamentos e gerar relatórios. 
                    Receba notificações sobre prazos de pagamento.
                  </p>
                  <div className="text-sm text-agri-dark font-medium">
                    📱 Acesso 24/7 pelo telemóvel ou computador
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button 
                onClick={() => setShowRegister(true)}
                className="bg-agri-primary text-white hover:bg-agri-dark px-8 py-4 rounded-xl text-lg font-semibold shadow-lg"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-agri-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Porquê Escolher o AgroCrédito?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A primeira plataforma digital de crédito agrícola pensada especificamente 
              para agricultores angolanos e suas necessidades.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-agri-primary bg-opacity-20 rounded-2xl p-8 border border-agri-primary border-opacity-30">
              <div className="bg-agri-secondary rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                <Smartphone className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Interface Simples</h3>
              <p className="text-gray-300 leading-relaxed">
                Desenhada para utilizadores com baixa literacia digital. 
                Botões grandes, textos claros e poucos passos para completar qualquer acção.
              </p>
            </div>

            <div className="bg-agri-primary bg-opacity-20 rounded-2xl p-8 border border-agri-primary border-opacity-30">
              <div className="bg-agri-accent rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                <Clock className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Aprovação Rápida</h3>
              <p className="text-gray-300 leading-relaxed">
                Análise automática em tempo real. Receba resposta sobre o seu pedido 
                em minutos, não em semanas como nos bancos tradicionais.
              </p>
            </div>

            <div className="bg-agri-primary bg-opacity-20 rounded-2xl p-8 border border-agri-primary border-opacity-30">
              <div className="bg-green-600 rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                <Shield className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">100% Seguro</h3>
              <p className="text-gray-300 leading-relaxed">
                Dados protegidos com tecnologia bancária. Criptografia de ponta 
                e conformidade com as normas de segurança angolanas.
              </p>
            </div>

            <div className="bg-agri-primary bg-opacity-20 rounded-2xl p-8 border border-agri-primary border-opacity-30">
              <div className="bg-orange-500 rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                <Calculator className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Simulador Avançado</h3>
              <p className="text-gray-300 leading-relaxed">
                Calcule prestações e juros antes de se comprometer. 
                Condições transparentes adaptadas ao tipo de projeto agrícola.
              </p>
            </div>

            <div className="bg-agri-primary bg-opacity-20 rounded-2xl p-8 border border-agri-primary border-opacity-30">
              <div className="bg-blue-600 rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                <CreditCard className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Gestão Total</h3>
              <p className="text-gray-300 leading-relaxed">
                Painel pessoal completo para acompanhar saldos, prestações, 
                histórico e gerar relatórios. Tudo num só lugar.
              </p>
            </div>

            <div className="bg-agri-primary bg-opacity-20 rounded-2xl p-8 border border-agri-primary border-opacity-30">
              <div className="bg-purple-600 rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                <FileText className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Relatórios Detalhados</h3>
              <p className="text-gray-300 leading-relaxed">
                Exporte relatórios em PDF para acompanhamento financeiro 
                e prestação de contas. Histórico completo sempre disponível.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-agri-primary to-agri-secondary rounded-2xl p-8 md:p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Pronto para Transformar o Seu Negócio Agrícola?
              </h3>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Junte-se a centenas de agricultores angolanos que já confiam no AgroCrédito 
                para financiar os seus projetos e expandir os seus negócios.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setShowRegister(true)}
                  className="bg-white text-agri-primary hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg"
                >
                  Criar Conta Gratuita
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-white text-white hover:bg-white hover:text-agri-primary px-8 py-4 rounded-xl text-lg font-semibold"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Testar Simulador
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Simulator Section */}
      <section id="simulator-section" className="py-20 bg-gradient-to-br from-agri-light to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-agri-dark mb-4">
              Simulador de Crédito Agrícola
            </h2>
            <p className="text-xl text-gray-600">
              Calcule as condições do seu financiamento em Kwanzas (AOA)
            </p>
          </div>
          
          <SimulatorForm />
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Iniciar Sessão</DialogTitle>
          </DialogHeader>
          <LoginForm 
            onSuccess={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Conta</DialogTitle>
          </DialogHeader>
          <RegisterForm 
            onSuccess={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
