import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocation } from "wouter";
import { useState } from "react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const faqs = [
  {
    question: "Como funciona o AgroCrédito?",
    answer: "O AgroCrédito é uma plataforma digital que conecta agricultores angolanos a instituições financeiras. O processo é simples: registe-se, simule o seu crédito, preencha a solicitação e receba resposta em minutos."
  },
  {
    question: "Que documentos preciso para me registar?",
    answer: "Precisa apenas do seu Bilhete de Identidade (BI), número de telemóvel angolano válido e opcionalmente um email. O NIF é opcional mas recomendado para empresas."
  },
  {
    question: "Posso usar apenas o telemóvel sem email?",
    answer: "Sim! O sistema foi pensado para agricultores que não têm email. Pode registar-se e fazer login apenas com o seu número de telemóvel angolano."
  },
  {
    question: "Quais são os tipos de projetos financiados?",
    answer: "Financiamos diversos projetos agrícolas: cultivo de milho, mandioca, criação de gado, avicultura, horticultura e outros projetos do setor agrícola."
  },
  {
    question: "Qual é o montante mínimo e máximo de crédito?",
    answer: "Os créditos variam entre AOA 500.000 e AOA 50.000.000, dependendo do tipo de projeto e do perfil do agricultor."
  },
  {
    question: "Quanto tempo demora a aprovação?",
    answer: "A análise é automática e recebe resposta em minutos. Para projetos mais complexos, pode demorar até 24 horas."
  },
  {
    question: "Como são calculadas as taxas de juro?",
    answer: "As taxas variam entre 13% e 18% ao ano, dependendo do tipo de projeto. Gado e milho têm taxas mais baixas por serem considerados menos arriscados."
  },
  {
    question: "Posso pagar antecipadamente?",
    answer: "Sim, pode fazer pagamentos antecipados sem penalizações. Isto reduzirá o total de juros a pagar."
  },
  {
    question: "Como acompanho os meus pagamentos?",
    answer: "No seu painel pessoal pode ver saldos devedores, próximas prestações, histórico completo e gerar relatórios em PDF."
  },
  {
    question: "O que acontece se não conseguir pagar uma prestação?",
    answer: "Entre em contacto connosco imediatamente. Oferecemos planos de reestruturação para agricultores em dificuldades temporárias."
  },
  {
    question: "Os meus dados estão seguros?",
    answer: "Sim, usamos criptografia de nível bancário e cumprimos todas as normas de segurança angolanas. Os seus dados nunca são partilhados sem consentimento."
  },
  {
    question: "Posso cancelar uma solicitação?",
    answer: "Pode cancelar solicitações pendentes a qualquer momento através do seu painel. Solicitações aprovadas não podem ser canceladas."
  }
];

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [openItems, setOpenItems] = useState<number[]>([]);
  
  // Check if user is logged in without using the auth hook to avoid loading issues
  const isLoggedIn = !!localStorage.getItem("auth_token");

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

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
              <h1 className="text-3xl font-bold text-agri-dark">Perguntas Frequentes</h1>
              <p className="text-gray-600">Encontre respostas para as dúvidas mais comuns sobre o AgroCrédito</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-agri-dark">
                Dúvidas Mais Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <Collapsible 
                  key={index} 
                  open={openItems.includes(index)}
                  onOpenChange={() => toggleItem(index)}
                >
                  <CollapsibleTrigger className="flex justify-between items-center w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="font-semibold text-agri-dark">{faq.question}</span>
                    {openItems.includes(index) ? 
                      <Minus className="w-5 h-5 text-agri-primary" /> : 
                      <Plus className="w-5 h-5 text-agri-primary" />
                    }
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 py-3 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Card className="bg-agri-light border-agri-primary">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-4">
                  Não encontrou a resposta?
                </h3>
                <p className="text-gray-700 mb-6">
                  A nossa equipa de suporte está disponível para ajudar com qualquer dúvida específica.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-agri-primary hover:bg-agri-dark">
                    Contactar Suporte
                  </Button>
                  <Button variant="outline" className="border-agri-primary text-agri-primary">
                    Enviar Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {!isLoggedIn && <Footer />}
    </div>
  );
}