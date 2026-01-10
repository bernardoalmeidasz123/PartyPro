
export interface BudgetItem {
  id: string;
  description: string;
  category: 'Mobilário' | 'Flores' | 'Iluminação' | 'Painéis' | 'Doces' | 'Outros';
  supplierCost: number; // O que a decoradora paga
  sellPrice: number;    // O que o cliente paga
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
  totalBudget: number; // Soma de sellPrice
  totalSupplierCost: number; // Soma de supplierCost
  status: 'Pendente' | 'Confirmado' | 'Finalizado' | 'Cancelado';
  notes: string;
}

export type ViewType = 'dashboard' | 'calendar' | 'events' | 'ai-helper';
