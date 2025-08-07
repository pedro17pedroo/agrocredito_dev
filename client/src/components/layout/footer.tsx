import { Sprout, Facebook, Twitter, Linkedin, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-agri-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <Sprout className="w-8 h-8 mr-3" />
              <span className="text-2xl font-bold">AgroCrédito</span>
            </div>
            <p className="text-gray-300 mb-6">
              Democratizando o acesso ao crédito agrícola em Angola. 
              Conectamos agricultores a instituições financeiras.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </button>
              <button className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </button>
              <button className="text-gray-300 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6">Serviços</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Crédito Agrícola
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Simulador de Financiamento
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Gestão de Contas
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Relatórios Financeiros
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Como Funciona
                </button>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contactar Suporte
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Termos de Serviço
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="text-agri-secondary mr-3 w-5 h-5" />
                <span className="text-gray-300">+244 923 456 789</span>
              </div>
              <div className="flex items-center">
                <Mail className="text-agri-secondary mr-3 w-5 h-5" />
                <span className="text-gray-300">suporte@agricredito.ao</span>
              </div>
              <div className="flex items-center">
                <MapPin className="text-agri-secondary mr-3 w-5 h-5" />
                <span className="text-gray-300">Luanda, Angola</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-12 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 AgroCrédito. Todos os direitos reservados. 
            <span className="text-agri-secondary"> Feito com ❤️ para o desenvolvimento agrícola de Angola</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
