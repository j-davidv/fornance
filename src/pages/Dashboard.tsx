import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ArrowUpIcon,
  UserGroupIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ActivityHistory from '../components/ActivityHistory';

const Dashboard = () => {
  const { cashBalance, expenses, setCashBalance, updateCurrency, isLoading } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(cashBalance.amount.toString());
  const [editCurrency, setEditCurrency] = useState(cashBalance.currency);

  const totalExpenses = expenses.reduce((acc, expense) => {
    if (expense.isPercentage) {
      return acc + (cashBalance.amount * expense.amount) / 100;
    }
    return acc + expense.amount;
  }, 0);

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setEditCurrency(newCurrency);
  };

  const handleSaveBalance = async () => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setCashBalance({
        amount,
        currency: cashBalance.currency, // Always use the current currency
      });

      setIsEditing(false);
      toast.success('Balance updated successfully');
    } catch (error) {
      toast.error('Failed to update balance');
      console.error('Error updating balance:', error);
    }
  };

  const currencies = [
    { code: 'NTD', name: 'New Taiwan Dollar' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'PHP', name: 'Philippine Peso' },
    { code: 'CNY', name: 'Chinese Yuan' },
  ];

  // Update local state when cashBalance changes
  useEffect(() => {
    setEditAmount(cashBalance.amount.toString());
    setEditCurrency(cashBalance.currency);
  }, [cashBalance]);

  return (
    <div className="container mx-auto px-2 py-3 md:px-4 md:py-4 max-w-[1400px]">
      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Balance Card */}
        <div className="glass-morphism p-3 md:p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <BanknotesIcon className="w-4 h-4 text-success" />
              <span>Current Balance</span>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-ghost btn-xs p-0"
                >
                  <PencilSquareIcon className="w-4 h-4 text-primary-600" />
                </button>
              )}
            </div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-success" />
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditAmount(cashBalance.amount.toString());
                  }}
                  className="btn btn-ghost btn-sm flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBalance}
                  className="btn btn-primary btn-sm flex-1"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl md:text-3xl font-bold text-success mt-1">
                {cashBalance.currency} {cashBalance.amount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Available to spend</p>
            </div>
          )}
        </div>

        {/* Total Expenses Card */}
        <div className="glass-morphism p-3 md:p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <ArrowTrendingDownIcon className="w-4 h-4 text-error" />
              <span>Total Expenses</span>
            </div>
            <Link 
              to="/expenses" 
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-error mt-1">
            {cashBalance.currency} {totalExpenses.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total spent this period</p>
        </div>

        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <div className="glass-morphism p-3 md:p-4 md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">Recent Expenses</h2>
              <Link 
                to="/expenses" 
                className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {expenses.slice(0, 6).map((expense) => (
                <div key={expense.id} className="glass-morphism p-2 rounded-lg">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-sm text-foreground">{expense.title}</p>
                      <p className="text-xs text-muted-foreground">{expense.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        {expense.isPercentage ? (
                          <>
                            {expense.amount}%
                            <span className="text-xs text-success block">
                              ≈ {cashBalance.currency} {((expense.baseAmount || 0) * expense.amount / 100).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          `${cashBalance.currency} ${expense.amount.toLocaleString()}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity History */}
        <div className="glass-morphism p-3 md:p-4 md:col-span-2">
          <ActivityHistory compact />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 