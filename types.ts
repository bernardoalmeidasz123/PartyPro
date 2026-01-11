export interface BudgetItem {
  id: string;
  description: string;
  category: 'Mobilário' | 'Flores' | 'Iluminação' | 'Painéis' | 'Doces' | 'Outros';
  supplierCost: number;
  sellPrice: number;
  paid: boolean;
}

export interface EventParty {
  id: string;
  title: string;
  clientName: string;
  date: string;
  time: string;
  location: string;
  theme: string;
  budgetItems: BudgetItem[];
  totalBudget: number;
  totalSupplierCost: number;
  status: 'Pendente' | 'Confirmado' | 'Finalizado' | 'Cancelado';
  notes: string;
  externalLink?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  instagram?: string;
  notes?: string;
  registeredAt: number;
}

export interface AccessRequest {
  id: string;
  email: string;
  timestamp: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  proofName: string;
}

// Fix: Updated ViewType to use 'ai-helper' instead of 'performance' to match component logic
export type ViewType = 'dashboard' | 'calendar' | 'events' | 'suppliers' | 'approvals' | 'ai-helper';