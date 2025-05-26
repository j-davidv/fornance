export interface CashBalance {
  amount: number;
  currency: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  isPercentage: boolean;
  baseAmount?: number; // Optional base amount for percentage calculations
} 