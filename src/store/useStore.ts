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

interface BudgetCategory {
  id: string;
  name: string;
  percentage: number;
  color: string;
  amount: number;
}

interface BudgetPlan {
  id: string;
  name: string;
  totalAmount: number;
  currency: string;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
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
  budgetPlans: BudgetPlan[];
  activeBudgetPlan: BudgetPlan | null;
  setCashBalance: (balance: CashBalance) => void;
  addFunds: (amount: number) => void;
  updateCurrency: (newCurrency: string) => Promise<void>;
  addExpense: (expense: ExpenseInput) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, expense: ExpenseInput) => void;
  createBudgetPlan: (name: string, totalAmount: number, categories: Omit<BudgetCategory, 'id' | 'amount'>[]) => void;
  updateBudgetPlan: (id: string, updates: Partial<BudgetPlan>) => void;
  deleteBudgetPlan: (id: string) => void;
  setActiveBudgetPlan: (id: string | null) => void;
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

// Default budget colors
const DEFAULT_BUDGET_COLORS = [
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
];

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
      budgetPlans: [],
      activeBudgetPlan: null,

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

      addFunds: (amount) => {
        const currentBalance = get().cashBalance;
        const newAmount = currentBalance.amount + amount;
        set((state) => ({
          cashBalance: { ...currentBalance, amount: newAmount },
          activityHistory: [
            {
              id: crypto.randomUUID(),
              type: 'add',
              description: `Added ${currentBalance.currency} ${amount.toLocaleString()} to balance`,
              timestamp: new Date().toISOString(),
              amount: amount,
              currency: currentBalance.currency,
            },
            ...state.activityHistory,
          ],
        }));
      },

      updateCurrency: async (newCurrency) => {
        const { cashBalance, expenses, budgetPlans } = get();
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

          // Update budget plans currency and amounts
          const updatedBudgetPlans = await Promise.all(
            budgetPlans.map(async (plan) => {
              const convertedTotalAmount = await convertCurrency(
                plan.totalAmount,
                oldCurrency,
                newCurrency
              );
              
              const updatedCategories = plan.categories.map((category) => ({
                ...category,
                amount: (convertedTotalAmount * category.percentage) / 100,
              }));

              return {
                ...plan,
                totalAmount: convertedTotalAmount,
                currency: newCurrency,
                categories: updatedCategories,
                updatedAt: new Date().toISOString(),
              };
            })
          );

          set((state) => ({
            cashBalance: { amount: newAmount, currency: newCurrency },
            expenses: updatedExpenses,
            budgetPlans: updatedBudgetPlans,
            activeBudgetPlan: state.activeBudgetPlan 
              ? updatedBudgetPlans.find(plan => plan.id === state.activeBudgetPlan?.id) || null 
              : null,
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
          if (!expense) return state;

          return {
            expenses: state.expenses.filter((e) => e.id !== id),
            activityHistory: [
              {
                id: crypto.randomUUID(),
                type: 'delete',
                description: `Removed expense: ${expense.title} ${
                  expense.isPercentage 
                    ? `(${expense.amount}% of ${state.cashBalance.currency} ${expense.baseAmount})`
                    : `(${state.cashBalance.currency} ${expense.amount})`
                }`,
                timestamp: new Date().toISOString(),
                amount: expense.amount,
                currency: expense.isPercentage ? undefined : state.cashBalance.currency,
                isPercentage: expense.isPercentage,
              },
              ...state.activityHistory,
            ],
          };
        }),

      updateExpense: (id, updatedExpense) =>
        set((state) => {
          const oldExpense = state.expenses.find((e) => e.id === id);
          if (!oldExpense) return state;

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
                description: `Updated expense: ${oldExpense.title} → ${updatedExpense.title} (${
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
          setDarkModeClass(newDarkMode);
          return {
            isDarkMode: newDarkMode,
          };
        }),

      clearHistory: () =>
        set(() => ({
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

      createBudgetPlan: (name, totalAmount, categories) => {
        const budgetCategories: BudgetCategory[] = categories.map((category, index) => ({
          ...category,
          id: crypto.randomUUID(),
          amount: (totalAmount * category.percentage) / 100,
          color: category.color || DEFAULT_BUDGET_COLORS[index % DEFAULT_BUDGET_COLORS.length],
        }));

        const newBudgetPlan: BudgetPlan = {
          id: crypto.randomUUID(),
          name,
          totalAmount,
          currency: get().cashBalance.currency,
          categories: budgetCategories,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          budgetPlans: [newBudgetPlan, ...state.budgetPlans],
          activeBudgetPlan: newBudgetPlan,
          activityHistory: [
            {
              id: crypto.randomUUID(),
              type: 'add',
              description: `Created budget plan: ${name} with ${get().cashBalance.currency} ${totalAmount.toLocaleString()}`,
              timestamp: new Date().toISOString(),
              amount: totalAmount,
              currency: get().cashBalance.currency,
            },
            ...state.activityHistory,
          ],
        }));
      },

      updateBudgetPlan: (id, updates) => {
        set((state) => {
          const updatedPlans = state.budgetPlans.map((plan) => {
            if (plan.id === id) {
              const updatedPlan = {
                ...plan,
                ...updates,
                updatedAt: new Date().toISOString(),
              };

              // Recalculate amounts if totalAmount or categories changed
              if (updates.totalAmount || updates.categories) {
                updatedPlan.categories = updatedPlan.categories.map((category) => ({
                  ...category,
                  amount: (updatedPlan.totalAmount * category.percentage) / 100,
                }));
              }

              return updatedPlan;
            }
            return plan;
          });

          return {
            budgetPlans: updatedPlans,
            activeBudgetPlan: state.activeBudgetPlan?.id === id 
              ? updatedPlans.find(plan => plan.id === id) || null 
              : state.activeBudgetPlan,
            activityHistory: [
              {
                id: crypto.randomUUID(),
                type: 'update',
                description: `Updated budget plan: ${updates.name || state.budgetPlans.find(p => p.id === id)?.name}`,
                timestamp: new Date().toISOString(),
              },
              ...state.activityHistory,
            ],
          };
        });
      },

      deleteBudgetPlan: (id) => {
        set((state) => {
          const planToDelete = state.budgetPlans.find(plan => plan.id === id);
          if (!planToDelete) return state;

          return {
            budgetPlans: state.budgetPlans.filter(plan => plan.id !== id),
            activeBudgetPlan: state.activeBudgetPlan?.id === id ? null : state.activeBudgetPlan,
            activityHistory: [
              {
                id: crypto.randomUUID(),
                type: 'delete',
                description: `Deleted budget plan: ${planToDelete.name}`,
                timestamp: new Date().toISOString(),
              },
              ...state.activityHistory,
            ],
          };
        });
      },

      setActiveBudgetPlan: (id) => {
        set((state) => ({
          activeBudgetPlan: id ? state.budgetPlans.find(plan => plan.id === id) || null : null,
        }));
      },
    }),
    {
      name: 'fornance-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cashBalance: state.cashBalance,
        expenses: state.expenses,
        isDarkMode: state.isDarkMode,
        activityHistory: state.activityHistory,
        budgetPlans: state.budgetPlans,
        activeBudgetPlan: state.activeBudgetPlan,
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

        if (!Array.isArray(state.budgetPlans)) {
          state.budgetPlans = [];
        }

        if (state.activeBudgetPlan && !state.budgetPlans.find(p => p.id === state.activeBudgetPlan?.id)) {
          state.activeBudgetPlan = null;
        }
      },
    }
  )
);