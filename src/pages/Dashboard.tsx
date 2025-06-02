import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BanknotesIcon,
  PencilSquareIcon,
  PlusIcon,
  WalletIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ActivityHistory from '../components/ActivityHistory';

const Dashboard = () => {
  const { cashBalance, expenses, setCashBalance, addFunds } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [editAmount, setEditAmount] = useState(cashBalance.amount.toString());
  const [addAmount, setAddAmount] = useState('');

  const totalExpenses = expenses.reduce((acc, expense) => {
    if (expense.isPercentage) {
      return acc + (cashBalance.amount * expense.amount) / 100;
    }
    return acc + expense.amount;
  }, 0);

  const remainingBalance = cashBalance.amount - totalExpenses;
  const expensePercentage = cashBalance.amount > 0 ? (totalExpenses / cashBalance.amount) * 100 : 0;

  // Update local state when cashBalance changes
  useEffect(() => {
    setEditAmount(cashBalance.amount.toString());
  }, [cashBalance]);

  const handleSaveBalance = async () => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setCashBalance({
        amount,
        currency: cashBalance.currency,
      });

      setIsEditing(false);
      toast.success('Balance updated successfully');
    } catch (error) {
      toast.error('Failed to update balance');
      console.error('Error updating balance:', error);
    }
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      addFunds(amount);
      setIsAddingFunds(false);
      setAddAmount('');
      toast.success(`${cashBalance.currency} ${amount.toLocaleString()} added successfully!`);
    } catch (error) {
      toast.error('Failed to add funds');
      console.error('Error adding funds:', error);
    }
  };

  const quickAddAmounts = [100, 500, 1000, 5000];

  return (
    <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 max-w-[1400px] mt-12">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
            <ChartBarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Financial Overview</h1>
            <p className="text-sm text-muted-foreground">Manage your finances with ease</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Live Dashboard</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {/* Enhanced Balance Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200/50 dark:border-emerald-800/30 shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800">
                  <WalletIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Current Balance</span>
                  <div className="flex items-center gap-2 mt-1">
                    {!isEditing && !isAddingFunds && (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                        >
                          <PencilSquareIcon className="w-3 h-3" />
                          Edit
                        </button>
                        <span className="text-emerald-300 dark:text-emerald-700">|</span>
                        <button
                          onClick={() => setIsAddingFunds(true)}
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                        >
                          <PlusIcon className="w-3 h-3" />
                          Add Funds
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter new balance"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditAmount(cashBalance.amount.toString());
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBalance}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : isAddingFunds ? (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter amount to add"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickAddAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setAddAmount(amount.toString())}
                      className="px-3 py-2 text-xs font-medium bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors"
                    >
                      +{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsAddingFunds(false);
                      setAddAmount('');
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFunds}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-105 transition-transform duration-300">
                  {cashBalance.currency} {cashBalance.amount.toLocaleString()}
                </div>
                <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Available to spend</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Total Expenses Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 border border-red-200/50 dark:border-red-800/30 shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800">
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Total Expenses</span>
                  <div className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                    {expensePercentage.toFixed(1)}% of balance
                  </div>
                </div>
              </div>
              <Link 
                to="/expenses" 
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors bg-red-100 dark:bg-red-900/50 px-3 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800/50"
              >
                View all
              </Link>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2 group-hover:scale-105 transition-transform duration-300">
              {cashBalance.currency} {totalExpenses.toLocaleString()}
            </div>
            <p className="text-sm text-red-600/80 dark:text-red-400/80">Total spent this period</p>
            <div className="mt-3 w-full bg-red-100 dark:bg-red-900/30 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(expensePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Remaining Balance Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 dark:border-blue-800/30 shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
                  <BanknotesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Remaining Balance</span>
                  <div className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                    After all expenses
                  </div>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${remainingBalance >= 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            </div>
            <div className={`text-3xl md:text-4xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 ${
              remainingBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {cashBalance.currency} {remainingBalance.toLocaleString()}
            </div>
            <p className={`text-sm ${
              remainingBalance >= 0 ? 'text-blue-600/80 dark:text-blue-400/80' : 'text-red-600/80 dark:text-red-400/80'
            }`}>
              {remainingBalance >= 0 ? 'Available funds' : 'Over budget'}
            </p>
          </div>
        </div>

        {/* Enhanced Recent Expenses */}
        {expenses.length > 0 && (
          <div className="md:col-span-3 rounded-2xl bg-white/80 dark:bg-gray-900/40 backdrop-blur-lg border border-gray-200/50 dark:border-white/[0.06] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 dark:border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border border-purple-200 dark:border-purple-800">
                    <ChartBarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Recent Expenses</h2>
                </div>
                <Link 
                  to="/expenses" 
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20"
                >
                  View all →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expenses.slice(0, 6).map((expense, index) => (
                  <div key={expense.id} className="group relative rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/30 dark:border-white/[0.06] p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{expense.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary/60" />
                          {expense.category}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">
                          {expense.isPercentage ? (
                            <>
                              <span className="text-primary-600 dark:text-primary-400">{expense.amount}%</span>
                              <span className="text-xs text-success block mt-0.5">
                                ≈ {cashBalance.currency} {((expense.baseAmount || 0) * expense.amount / 100).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            `${cashBalance.currency} ${expense.amount.toLocaleString()}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Activity History */}
        <div className="md:col-span-3 rounded-2xl bg-white/80 dark:bg-gray-900/40 backdrop-blur-lg border border-gray-200/50 dark:border-white/[0.06] shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200/50 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 border border-indigo-200 dark:border-indigo-800">
                <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Activity History</h2>
            </div>
          </div>
          <div className="p-6">
            <ActivityHistory compact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 