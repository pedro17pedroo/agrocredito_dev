import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import SimulatorForm from "@/components/credit/simulator-form";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function Simulator() {
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
              <h1 className="text-3xl font-bold text-agri-dark">Simulador de Crédito Agrícola</h1>
              <p className="text-gray-600">Calcule as condições do seu financiamento em Kwanzas (AOA)</p>
            </div>
          </div>

          <SimulatorForm />
        </div>
      </div>

      {!isLoggedIn && <Footer />}
    </div>
  );
}
