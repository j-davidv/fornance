import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Expense, CashBalance } from '../types';
import { convertCurrency } from '../services/currencyService';
import toast from 'react-hot-toast';

interface ActivityItem {
  id: string;
  type: 'add' | 'update' | 'delete' | 'convert';
  description: string;
  timestamp: string;
  amount?: number;
  currency?: string;
  isPercentage?: boolean;
}

type ExpenseInput = {
  title: string;
  amount: number;
  category: string;
  isPercentage: boolean;
  baseAmount?: number;
};

interface Store {
  isLoading: boolean;
  cashBalance: CashBalance;
  expenses: Expense[];
  isDarkMode: boolean;
  activityHistory: ActivityItem[];
  setCashBalance: (balance: CashBalance) => void;
  updateCurrency: (newCurrency: string) => Promise<void>;
  addExpense: (expense: ExpenseInput) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, expense: ExpenseInput) => void;
  toggleDarkMode: () => void;
  clearHistory: () => void;
  clearAllExpenses: () => void;
}

// Add this function to handle dark mode class
const setDarkModeClass = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      isLoading: false,
      cashBalance: {
        amount: 0,
        currency: 'USD',
      },
      expenses: [],
      isDarkMode: true, // Set dark mode as default
      activityHistory: [],

      setCashBalance: (balance) => {
        const currentBalance = get().cashBalance;
        set((state) => ({
          cashBalance: balance,
          activityHistory: [
            {
              id: crypto.randomUUID(),
              type: 'update',
              description: `Updated balance from ${currentBalance.currency} ${currentBalance.amount} to ${balance.currency} ${balance.amount}`,
              timestamp: new Date().toISOString(),
              amount: balance.amount,
              currency: balance.currency,
            },
            ...state.activityHistory,
          ],
        }));
      },

      updateCurrency: async (newCurrency) => {
        const { cashBalance, expenses } = get();
        const oldCurrency = cashBalance.currency;

        set({ isLoading: true });

        try {
          const newAmount = await convertCurrency(
            cashBalance.amount,
            oldCurrency,
            newCurrency
          );

          const updatedExpenses = await Promise.all(
            expenses.map(async (expense) => {
              if (!expense.isPercentage) {
                const convertedAmount = await convertCurrency(
                  expense.amount,
                  oldCurrency,
                  newCurrency
                );
                return { ...expense, amount: convertedAmount };
              }
              return expense;
            })
          );

          set((state) => ({
            cashBalance: { amount: newAmount, currency: newCurrency },
            expenses: updatedExpenses,
            activityHistory: [
              {
                id: crypto.randomUUID(),
                type: 'convert',
                description: `Converted currency from ${oldCurrency} to ${newCurrency}`,
                timestamp: new Date().toISOString(),
                amount: newAmount,
                currency: newCurrency,
              },
              ...state.activityHistory,
            ],
            isLoading: false,
          }));

          toast.success('Currency converted successfully');
        } catch (error) {
          set({ isLoading: false });
          console.error('Error converting currency:', error);
          toast.error('Failed to convert currency');
        }
      },

      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            {
              ...expense,
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
            },
            ...state.expenses,
          ],
          activityHistory: [
            {
              id: crypto.randomUUID(),
              type: 'add',
              description: `Added expense: ${expense.title} - ${
                expense.isPercentage 
                  ? `${expense.amount}% of ${state.cashBalance.currency} ${expense.baseAmount}`
                  : `${state.cashBalance.currency} ${expense.amount}`
              }`,
              timestamp: new Date().toISOString(),
              amount: expense.amount,
              currency: expense.isPercentage ? undefined : state.cashBalance.currency,
              isPercentage: expense.isPercentage,
            },
            ...state.activityHistory,
          ],
        })),

      removeExpense: (id) =>
        set((state) => {
          const expense = state.expenses.find((e) => e.id === id);
          return {
            expenses: state.expenses.filter((expense) => expense.id !== id),
            activityHistory: [
              {
                id: crypto.randomUUID(),
                type: 'delete',
                description: `Removed expense: ${expense?.title} ${
                  expense?.isPercentage 
                    ? `(${expense.amount}% of ${state.cashBalance.currency} ${expense.baseAmount})`
                    : `(${state.cashBalance.currency} ${expense?.amount})`
                }`,
                timestamp: new Date().toISOString(),
                amount: expense?.amount,
                currency: expense?.isPercentage ? undefined : state.cashBalance.currency,
                isPercentage: expense?.isPercentage,
              },
              ...state.activityHistory,
            ],
          };
        }),

      updateExpense: (id, updatedExpense) =>
        set((state) => {
          const oldExpense = state.expenses.find((e) => e.id === id);
          return {
            expenses: state.expenses.map((expense) =>
              expense.id === id
                ? {
                    ...expense,
                    ...updatedExpense,
                  }
                : expense
            ),
            activityHistory: [
              {
                id: crypto.randomUUID(),
                type: 'update',
                description: `Updated expense: ${oldExpense?.title} → ${updatedExpense.title} (${
                  updatedExpense.isPercentage 
                    ? `${updatedExpense.amount}% of ${state.cashBalance.currency} ${updatedExpense.baseAmount}`
                    : `${state.cashBalance.currency} ${updatedExpense.amount}`
                })`,
                timestamp: new Date().toISOString(),
                amount: updatedExpense.amount,
                currency: updatedExpense.isPercentage ? undefined : state.cashBalance.currency,
                isPercentage: updatedExpense.isPercentage,
              },
              ...state.activityHistory,
            ],
          };
        }),

      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.isDarkMode;
          setDarkModeClass(newDarkMode); // Apply dark mode class
          return {
            isDarkMode: newDarkMode,
          };
        }),

      clearHistory: () =>
        set((state) => ({
          activityHistory: [],
        })),

      clearAllExpenses: () =>
        set((state) => ({
          expenses: [],
          activityHistory: [
            {
              id: crypto.randomUUID(),
              type: 'delete',
              description: 'Cleared all expenses',
              timestamp: new Date().toISOString(),
            },
            ...state.activityHistory,
          ],
        })),
    }),
    {
      name: 'fornance-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cashBalance: state.cashBalance,
        expenses: state.expenses,
        isDarkMode: state.isDarkMode,
        activityHistory: state.activityHistory,
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        console.log('State rehydrated from storage');
        
        if (!state) {
          console.warn('No state was rehydrated');
          setDarkModeClass(true); // Set dark mode if no state
          return;
        }

        // Apply dark mode based on stored state
        setDarkModeClass(state.isDarkMode);

        if (!state.cashBalance) {
          state.cashBalance = {
            amount: 0,
            currency: 'USD',
          };
        }

        if (!Array.isArray(state.expenses)) {
          state.expenses = [];
        }

        if (!Array.isArray(state.activityHistory)) {
          state.activityHistory = [];
        }
      },
    }
  )
);