export function formatAngolaPhone(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove country code if present
  if (cleaned.startsWith('244')) {
    cleaned = cleaned.substring(3);
  }
  
  // Format as +244 9XX XXX XXX
  if (cleaned.length >= 9) {
    const formatted = `+244 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)}`;
    return formatted;
  }
  
  return phone;
}

export function validateAngolaPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // Should be 9 digits after country code
  if (cleaned.length === 12 && cleaned.startsWith('244')) {
    const number = cleaned.substring(3);
    // Angola mobile numbers typically start with 9
    return number.startsWith('9') && number.length === 9;
  }
  
  if (cleaned.length === 9) {
    return cleaned.startsWith('9');
  }
  
  return false;
}

export function formatKwanza(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return 'AOA 0';
  
  return `AOA ${num.toLocaleString('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function parseKwanza(formatted: string): number {
  // Remove everything except digits
  const cleaned = formatted.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
}

export function validateBI(bi: string): boolean {
  // Basic validation for Angola BI format
  // Typically 9 digits + 2 letters + 3 digits
  const pattern = /^\d{9}[A-Z]{2}\d{3}$/;
  return pattern.test(bi.toUpperCase());
}

export function validateNIF(nif: string): boolean {
  // Basic validation for Angola NIF - typically 10 digits
  const pattern = /^\d{10}$/;
  return pattern.test(nif);
}

export function getProjectTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    corn: 'Cultivo de Milho',
    cassava: 'Cultivo de Mandioca',
    cattle: 'Criação de Gado',
    poultry: 'Avicultura',
    horticulture: 'Horticultura',
    other: 'Outro',
  };
  
  return labels[type] || type;
}

export function getStatusLabel(status: string): { label: string; className: string } {
  const statusMap: { [key: string]: { label: string; className: string } } = {
    pending: {
      label: 'Pendente',
      className: 'bg-yellow-100 text-yellow-800',
    },
    approved: {
      label: 'Aprovado',
      className: 'bg-green-100 text-green-800',
    },
    rejected: {
      label: 'Rejeitado',
      className: 'bg-red-100 text-red-800',
    },
  };
  
  return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
