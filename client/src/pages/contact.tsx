import { ArrowLeft, Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if user is logged in without using the auth hook to avoid loading issues
  const isLoggedIn = !!localStorage.getItem("auth_token");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (isLoggedIn) {
      setLocation("/dashboard");
    } else {
      setLocation("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Mensagem Enviada",
        description: "Recebemos a sua mensagem. Responderemos em até 24 horas.",
      });
      setIsSubmitting(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoggedIn && <Navbar />}
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-agri-dark">Contactar Suporte</h1>
              <p className="text-gray-600">Entre em contacto connosco. Estamos aqui para ajudar!</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-agri-dark flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  Enviar Mensagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="O seu nome completo"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telemóvel *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+244 9XX XXX XXX"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seuemail@exemplo.com (opcional)"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Sobre o que gostaria de falar?"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Descreva detalhadamente a sua dúvida ou problema..."
                      required
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-agri-primary hover:bg-agri-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-agri-dark">Informações de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="text-agri-primary mr-4 w-5 h-5" />
                    <div>
                      <p className="font-semibold">Telefone</p>
                      <p className="text-gray-600">+244 923 456 789</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="text-agri-primary mr-4 w-5 h-5" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-gray-600">suporte@agricredito.ao</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="text-agri-primary mr-4 w-5 h-5" />
                    <div>
                      <p className="font-semibold">Localização</p>
                      <p className="text-gray-600">Luanda, Angola</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="text-agri-primary mr-4 w-5 h-5" />
                    <div>
                      <p className="font-semibold">Horário de Atendimento</p>
                      <p className="text-gray-600">Segunda a Sexta: 8h - 18h</p>
                      <p className="text-gray-600">Sábado: 8h - 12h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-agri-light border-agri-primary">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-agri-dark mb-3">
                    Suporte Rápido
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Para questões urgentes, ligue directamente para o nosso número de suporte. 
                    Estamos disponíveis para ajudar com problemas técnicos e dúvidas sobre créditos.
                  </p>
                  <Button className="w-full bg-agri-primary hover:bg-agri-dark">
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar Agora
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-agri-dark mb-3">
                    Perguntas Mais Comuns
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Antes de entrar em contacto, consulte as nossas perguntas frequentes. 
                    Pode encontrar a resposta mais rapidamente!
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-agri-primary text-agri-primary"
                    onClick={() => setLocation("/faq")}
                  >
                    Ver FAQ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {!isLoggedIn && <Footer />}
    </div>
  );
}