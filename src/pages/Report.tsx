import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Report = () => {
  const { expenses, cashBalance } = useStore();

  const report = useMemo(() => {
    const totalExpenses = expenses.reduce((acc, expense) => {
      if (expense.isPercentage) {
        return acc + (cashBalance.amount * expense.amount) / 100;
      }
      return acc + expense.amount;
    }, 0);

    const expensesByCategory = expenses.reduce((acc, expense) => {
      const amount = expense.isPercentage
        ? (cashBalance.amount * expense.amount) / 100
        : expense.amount;
      
      acc[expense.category] = (acc[expense.category] || 0) + amount;
      return acc;
    }, {} as { [key: string]: number });

    const remainingBalance = cashBalance.amount - totalExpenses;
    const percentageSpent = (totalExpenses / cashBalance.amount) * 100;

    return {
      totalExpenses,
      remainingBalance,
      expensesByCategory,
      percentageSpent,
    };
  }, [expenses, cashBalance]);

  const chartData = Object.entries(report.expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-morphism p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Financial Report</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-morphism p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Overview</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground/80">Total Budget:</span>
                <span className="font-semibold text-foreground">
                  {cashBalance.currency} {cashBalance.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Total Expenses:</span>
                <span className="font-semibold text-red-500 dark:text-red-400">
                  {cashBalance.currency} {report.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Remaining Balance:</span>
                <span className="font-semibold text-green-500 dark:text-green-400">
                  {cashBalance.currency} {report.remainingBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Percentage Spent:</span>
                <span className="font-semibold text-foreground">
                  {report.percentageSpent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="glass-morphism p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Expenses by Category</h2>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `${cashBalance.currency} ${value.toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-morphism p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Category Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(report.expensesByCategory).map(([category, amount], index) => (
              <div key={category} className="flex items-center space-x-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-foreground">{category}</span>
                    <span className="font-semibold text-foreground">
                      {cashBalance.currency} {amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(amount / report.totalExpenses) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report; 