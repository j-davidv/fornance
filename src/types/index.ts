export interface Expense {
  id: string;
  title: string;
  amount: number;
  isPercentage: boolean;
  category: string;
  date: string;
  baseAmount?: number;
}

export interface CashBalance {
  amount: number;
  currency: string;
}

export interface Report {
  totalExpenses: number;
  remainingBalance: number;
  expensesByCategory: {
    [category: string]: number;
  };
  percentageSpent: number;
}

export interface Currency {
  code: string;
  name: string;
  rate: number;
}

export interface ThemeConfig {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
} 