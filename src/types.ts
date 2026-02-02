export enum UserRole {
  ADMIN = 'admin',
  RESIDENT = 'resident'
}

export interface User {
  role: UserRole;
  username: string;
  condoKey: string;
  houseId?: string;
}

export interface House {
  id: string;
  name: string;
  owner: string;
  balance: number;
}

export interface Payment {
  id: string;
  houseId: string;
  amount: number;
  date: string;
  concept: string;
  method: string;
}

export interface Expense {
  id: string;
  concept: string;
  amount: number;
  date: string;
  category: string;
}

export interface Suggestion {
  id: string;
  houseId: string;
  message: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface AppState {
  user: User | null;
  houses: House[];
  payments: Payment[];
  expenses: Expense[];
  suggestions: Suggestion[];
  googleScriptUrl: string;
}