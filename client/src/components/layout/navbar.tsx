import { Sprout, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export default function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <Sprout className="text-agri-primary text-2xl mr-3" />
              <span className="text-2xl font-bold text-agri-dark">AgroCrédito</span>
            </div>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-700 hover:text-agri-primary px-3 py-2 rounded-md text-base font-medium">
                Início
              </Link>
              <button 
                onClick={() => document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-agri-primary px-3 py-2 rounded-md text-base font-medium"
              >
                Simulador
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-agri-primary px-3 py-2 rounded-md text-base font-medium"
              >
                Como Funciona
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onLoginClick}
              className="border-2 border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white"
            >
              Entrar
            </Button>
            <Button
              onClick={onRegisterClick}
              className="bg-agri-primary text-white hover:bg-agri-dark"
            >
              Registar
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-agri-primary font-medium">
                Início
              </Link>
              <button 
                onClick={() => {
                  document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="block text-left px-3 py-2 text-gray-700 hover:text-agri-primary font-medium"
              >
                Simulador
              </button>
              <button 
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="block text-left px-3 py-2 text-gray-700 hover:text-agri-primary font-medium"
              >
                Como Funciona
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
