import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentRequirement {
  id: string;
  name: string;
  required: boolean;
  description?: string;
}

interface DocumentUploadProps {
  userType: "farmer" | "company" | "cooperative";
  documents: { [key: string]: File | null };
  onDocumentChange: (documentId: string, file: File | null) => void;
}

const DOCUMENT_REQUIREMENTS: { [key: string]: DocumentRequirement[] } = {
  farmer: [
    { id: "bi", name: "Bilhete de Identidade (BI)", required: true },
    { id: "soba_declaration", name: "Declaração do Soba", required: true },
    { id: "municipal_declaration", name: "Declaração da Administração Municipal", required: true },
    { id: "agricultural_proof", name: "Comprovativo da Actividade Agrícola", required: true },
    { id: "residence_certificate", name: "Atestado de Residência", required: false, description: "Opcional" },
  ],
  company: [
    { id: "bi", name: "Bilhete de Identidade (BI)", required: true },
    { id: "company_document", name: "Documento da Empresa", required: true },
    { id: "agricultural_proof", name: "Comprovativo da Actividade Agrícola", required: true },
    { id: "business_plan", name: "Plano de Negócio", required: true },
    { id: "residence_proof", name: "Comprovativo de Residência", required: true },
    { id: "nif", name: "NIF", required: true },
    { id: "commercial_license", name: "Alvará Comercial", required: true },
    { id: "bank_statement", name: "Extrato Bancário", required: true },
  ],
  cooperative: [
    { id: "bi", name: "Bilhete de Identidade (BI)", required: true },
    { id: "company_document", name: "Documento da Cooperativa", required: true },
    { id: "agricultural_proof", name: "Comprovativo da Actividade Agrícola", required: true },
    { id: "business_plan", name: "Plano de Negócio", required: true },
    { id: "residence_proof", name: "Comprovativo de Residência", required: true },
    { id: "nif", name: "NIF", required: true },
    { id: "commercial_license", name: "Alvará Comercial", required: true },
    { id: "bank_statement", name: "Extrato Bancário", required: true },
  ],
};

export default function DocumentUpload({ userType, documents, onDocumentChange }: DocumentUploadProps) {
  const requirements = DOCUMENT_REQUIREMENTS[userType] || [];
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const handleFileChange = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onDocumentChange(documentId, file);
  };

  const handleDrop = (documentId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggedOver(null);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      onDocumentChange(documentId, files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (documentId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggedOver(documentId);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDraggedOver(null);
    }
  };

  const removeDocument = (documentId: string) => {
    onDocumentChange(documentId, null);
  };

  const getUserTypeLabel = () => {
    const labels = {
      farmer: "Agricultor Familiar",
      company: "Empresa Agrícola", 
      cooperative: "Cooperativa Agrícola"
    };
    return labels[userType] || userType;
  };

  const getRequiredCount = () => requirements.filter(req => req.required).length;
  const getUploadedRequiredCount = () => {
    return requirements.filter(req => req.required && documents[req.id]).length;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidFileType = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    return validTypes.includes(file.type);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-agri-dark">
          <FileText className="w-5 h-5 mr-2" />
          Documentos Necessários - {getUserTypeLabel()}
        </CardTitle>
        <div className="flex items-center justify-between">
          <Badge variant={getUploadedRequiredCount() === getRequiredCount() ? "default" : "secondary"}>
            {getUploadedRequiredCount()}/{getRequiredCount()} documentos obrigatórios
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Faça upload dos documentos em formato JPG, PNG ou PDF. Tamanho máximo: 5MB por arquivo.
          </AlertDescription>
        </Alert>

        {requirements.map((requirement) => {
          const file = documents[requirement.id];
          const hasFile = !!file;
          const isValid = hasFile && isValidFileType(file);
          
          return (
            <div key={requirement.id} className="space-y-2">
              <Label className="flex items-center">
                {requirement.name}
                {requirement.required ? (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Obrigatório
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Opcional
                  </Badge>
                )}
                {requirement.description && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({requirement.description})
                  </span>
                )}
              </Label>
              
              <div
                className={`
                  border-2 border-dashed rounded-lg p-4 transition-colors relative overflow-hidden
                  ${draggedOver === requirement.id ? 'border-agri-primary bg-agri-light/10' : 'border-gray-300'}
                  ${hasFile ? 'bg-green-50 border-green-300' : 'hover:border-agri-primary hover:bg-agri-light/5'}
                `}
                onDrop={(e) => handleDrop(requirement.id, e)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(requirement.id, e)}
                onDragLeave={handleDragLeave}
              >
                {hasFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                          {!isValid && " - Formato inválido"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(requirement.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Clique para selecionar ou arraste o arquivo aqui
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG ou PDF - Máx. 5MB
                    </p>
                  </div>
                )}
                
                {!hasFile && (
                  <Input
                    id={`file-input-${requirement.id}`}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(requirement.id, e)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}