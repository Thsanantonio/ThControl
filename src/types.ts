export enum UserRole {
  ADMIN = 'admin',
  RESIDENT = 'resident'
}

export interface User {
  role: UserRole;
  houseId?: string;
}

export interface House {
  id: string;
  name: string;
  owner: string;
  balance: number;
  street: string;
}

export enum PaymentType {
  ORDINARIA = 'Cuota Ordinaria mensual',
  EXTRAORDINARIA = 'Cuota Extraordinaria'
}

export interface Payment {
  id: string;
  houseId: string;
  amount: number;
  date: string;
  paymentType: PaymentType;
  extraordinaryReason?: string;
  method: string;
  referenciaBancaria?: string;
  montoBs?: number;
  tasaCambio?: number;
  totalUsd?: number;
  receiptUrl?: string;
}

export interface Expense {
  id: string;
  concept: string;
  amount: number;
  date: string;
  category: string;
  montoBs?: number;
  tasaCambio?: number;
  totalUsd?: number;
  invoiceUrl?: string;
}

export interface Suggestion {
  id: string;
  houseId: string;
  message: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
  ipAddress?: string;
}

export interface AppState {
  user: User | null;
  houses: House[];
  payments: Payment[];
  expenses: Expense[];
  suggestions: Suggestion[];
}