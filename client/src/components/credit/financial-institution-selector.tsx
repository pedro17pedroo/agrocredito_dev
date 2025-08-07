import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatKwanza } from "@/lib/angola-utils";

interface FinancialInstitution {
  id: string;
  fullName: string;
  userType: string;
  isActive: boolean;
}

interface CreditProgram {
  id: string;
  name: string;
  description: string;
  projectTypes: string[];
  minAmount: string;
  maxAmount: string;
  minTerm: number;
  maxTerm: number;
  interestRate: string;
  effortRate: string;
  processingFee: string;
  financialInstitutionId: string;
}

interface FinancialInstitutionSelectorProps {
  selectedInstitution?: string;
  onInstitutionChange: (institutionId: string) => void;
  selectedProgram?: string;
  onProgramChange: (programId: string, program?: CreditProgram) => void;
  projectType?: string;
}

export default function FinancialInstitutionSelector({
  selectedInstitution,
  onInstitutionChange,
  selectedProgram,
  onProgramChange,
  projectType
}: FinancialInstitutionSelectorProps) {
  const [filteredPrograms, setFilteredPrograms] = useState<CreditProgram[]>([]);

  // Fetch financial institutions
  const { data: institutions = [], isLoading: institutionsLoading } = useQuery({
    queryKey: ["/api/users/financial-institutions"],
  });

  // Fetch all credit programs
  const { data: allPrograms = [], isLoading: programsLoading } = useQuery({
    queryKey: ["/api/credit-programs/public"],
  });

  // Fetch programs by selected institution
  const { data: institutionPrograms = [] } = useQuery({
    queryKey: ["/api/credit-programs/institution", selectedInstitution],
    enabled: !!selectedInstitution,
  });

  // Filter programs based on selection and project type
  useEffect(() => {
    let programs: CreditProgram[] = selectedInstitution ? 
      (institutionPrograms as CreditProgram[]) : 
      (allPrograms as CreditProgram[]);
    
    if (projectType && programs && programs.length > 0) {
      programs = programs.filter((program: CreditProgram) => 
        program.projectTypes.includes(projectType) || program.projectTypes.includes("other")
      );
    }
    
    setFilteredPrograms(programs || []);
  }, [selectedInstitution, institutionPrograms, allPrograms, projectType]);

  const handleProgramChange = (programId: string) => {
    if (programId === "none") {
      onProgramChange("", undefined);
    } else {
      const program = filteredPrograms.find(p => p.id === programId);
      onProgramChange(programId, program);
    }
  };

  const getProjectTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      corn: "Milho",
      cassava: "Mandioca", 
      cattle: "Pecuária",
      poultry: "Avicultura",
      horticulture: "Horticultura",
      other: "Outros"
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Financial Institution Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-agri-dark">
            <Building className="w-5 h-5 mr-2" />
            Instituição Financeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="institution-select">
                Selecionar Instituição (Opcional)
              </Label>
              <Select 
                value={selectedInstitution || "all"} 
                onValueChange={(value) => onInstitutionChange(value === "all" ? "" : value)}
              >
                <SelectTrigger id="institution-select">
                  <SelectValue placeholder="Ver todos os programas ou selecionar instituição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os programas de crédito</SelectItem>
                  {(institutions as FinancialInstitution[]).map((institution: FinancialInstitution) => (
                    <SelectItem key={institution.id} value={institution.id}>
                      {institution.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedInstitution && (
              <div className="p-3 bg-agri-light/10 rounded-lg">
                <p className="text-sm text-agri-dark">
                  <strong>Instituição Selecionada:</strong>{" "}
                  {(institutions as FinancialInstitution[]).find((i: FinancialInstitution) => i.id === selectedInstitution)?.fullName}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credit Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-agri-dark">
            <CreditCard className="w-5 h-5 mr-2" />
            Programas de Crédito Disponíveis
            {filteredPrograms.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredPrograms.length} programas
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {programsLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agri-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Carregando programas...</p>
            </div>
          )}

          {!programsLoading && filteredPrograms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum programa de crédito disponível</p>
              {projectType && (
                <p className="text-sm mt-1">
                  para o tipo de projeto: {getProjectTypeLabel(projectType)}
                </p>
              )}
            </div>
          )}

          {!programsLoading && filteredPrograms.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="program-select">Selecionar Programa de Crédito</Label>
                <Select value={selectedProgram || "none"} onValueChange={(value) => handleProgramChange(value === "none" ? "" : value)}>
                  <SelectTrigger id="program-select">
                    <SelectValue placeholder="Escolher programa de crédito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Escolher programa de crédito</SelectItem>
                    {filteredPrograms.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{program.name}</span>
                          <span className="text-xs text-gray-500">
                            {formatKwanza(parseInt(program.minAmount))} - {formatKwanza(parseInt(program.maxAmount))} 
                            • {program.interestRate}% ano
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Program Details */}
              {selectedProgram && (() => {
                const program = filteredPrograms.find(p => p.id === selectedProgram);
                if (!program) return null;
                
                return (
                  <div className="p-4 bg-agri-light/10 rounded-lg space-y-3">
                    <h4 className="font-semibold text-agri-dark">{program.name}</h4>
                    {program.description && (
                      <p className="text-sm text-gray-600">{program.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Montante:</span>
                        <br />
                        {formatKwanza(parseInt(program.minAmount))} - {formatKwanza(parseInt(program.maxAmount))}
                      </div>
                      <div>
                        <span className="font-medium">Prazo:</span>
                        <br />
                        {program.minTerm} - {program.maxTerm} meses
                      </div>
                      <div>
                        <span className="font-medium">Taxa de Juro:</span>
                        <br />
                        {program.interestRate}% anual
                      </div>
                      <div>
                        <span className="font-medium">Taxa de Esforço:</span>
                        <br />
                        Máx. {program.effortRate}%
                      </div>
                    </div>
                    
                    {program.projectTypes.length > 0 && (
                      <div className="pt-2">
                        <span className="font-medium text-sm">Tipos de Projetos Suportados:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {program.projectTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {getProjectTypeLabel(type)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}