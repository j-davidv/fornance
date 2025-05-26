import React, { useState, FormEvent } from 'react';
import { useStore } from '../store/useStore';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ExportReport from '../components/ExportReport';

const Expenses = () => {
  const { expenses, addExpense, removeExpense, updateExpense, cashBalance, isLoading, clearAllExpenses } = useStore();
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    isPercentage: false,
    category: 'General',
    baseAmount: '',
  });

  const [editingExpense, setEditingExpense] = useState<null | {
    id: string;
    title: string;
    amount: number;
    isPercentage: boolean;
    category: string;
    baseAmount?: number;
  }>(null);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newExpense.isPercentage && !newExpense.baseAmount) {
      toast.error('Please specify the base amount for percentage calculation');
      return;
    }

    addExpense({
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      isPercentage: newExpense.isPercentage,
      category: newExpense.category,
      baseAmount: newExpense.isPercentage ? parseFloat(newExpense.baseAmount) : undefined,
    });

    setNewExpense({
      title: '',
      amount: '',
      isPercentage: false,
      category: 'General',
      baseAmount: '',
    });

    toast.success('Expense added successfully');
  };

  const handleEdit = (expense: typeof editingExpense) => {
    if (!expense) return;
    
    if (!expense.title || !expense.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (expense.isPercentage && !expense.baseAmount) {
      toast.error('Please specify the base amount for percentage calculation');
      return;
    }

    updateExpense(expense.id, {
      title: expense.title,
      amount: expense.amount,
      isPercentage: expense.isPercentage,
      category: expense.category,
      baseAmount: expense.isPercentage ? expense.baseAmount : undefined,
    });

    setEditingExpense(null);
    toast.success('Expense updated successfully');
  };

  const formatAmount = (expense: any) => {
    if (expense.isPercentage) {
      const actualAmount = (expense.baseAmount * expense.amount) / 100;
      return (
        <div className="text-right">
          <p className="font-semibold text-foreground text-sm md:text-base break-words">
            {expense.amount}% of {cashBalance.currency} {expense.baseAmount?.toLocaleString()}
          </p>
          <p className="text-xs text-primary-600 dark:text-primary-400">
            ≈ {cashBalance.currency} {actualAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return (
      <p className="font-semibold text-foreground text-sm md:text-base break-words">
        {cashBalance.currency} {expense.amount.toLocaleString()}
      </p>
    );
  };

  const handleDeleteAll = () => {
    clearAllExpenses();
    setShowDeleteConfirmation(false);
    toast.success('All expenses deleted');
  };

  return (
    <div className="container mx-auto px-3 py-3 md:px-4 md:py-4 max-w-4xl">
      <div className="glass-morphism p-3 md:p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Manage Expenses</h1>
          {expenses.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="btn btn-error btn-outline btn-xs md:btn-sm gap-1"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Delete All
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="col-span-2 md:col-span-1">
              <input
                type="text"
                placeholder="Expense Title"
                className="input input-bordered input-sm md:input-md w-full"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <input
                type="number"
                placeholder="Amount"
                className="input input-bordered input-sm md:input-md w-full"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <select
                className="select select-bordered select-sm md:select-md w-full"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-1 flex items-center gap-2 px-2">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={newExpense.isPercentage}
                onChange={(e) => setNewExpense({ ...newExpense, isPercentage: e.target.checked })}
              />
              <span className="text-sm text-foreground">Calculate as percentage</span>
            </div>
            {newExpense.isPercentage && (
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Base Amount (for percentage calculation)"
                  className="input input-bordered input-sm md:input-md w-full"
                  value={newExpense.baseAmount}
                  onChange={(e) => setNewExpense({ ...newExpense, baseAmount: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>
          
          <button type="submit" className="btn btn-primary btn-sm md:btn-md w-full">
            Add Expense
          </button>
        </form>

        <div className="space-y-2">
          {expenses.map((expense) => (
            <div key={expense.id} className="glass-morphism p-2 md:p-3">
              <div className="flex flex-col md:flex-row justify-between gap-2 md:items-center">
                <div className="space-y-0.5">
                  <h3 className="font-medium text-sm md:text-base text-foreground">{expense.title}</h3>
                  <p className="text-xs text-muted-foreground">{expense.category}</p>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                  {formatAmount(expense)}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="btn btn-ghost btn-xs p-1"
                      title="Edit Expense"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5 text-primary-600" />
                    </button>
                    <button
                      onClick={() => {
                        removeExpense(expense.id);
                        toast.success('Expense removed');
                      }}
                      className="btn btn-ghost btn-xs p-1"
                      title="Delete Expense"
                    >
                      <TrashIcon className="w-3.5 h-3.5 text-error" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Report Section */}
      <div className="glass-morphism p-3 md:p-4 mt-3 md:mt-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Export Report</h2>
        <ExportReport />
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-morphism p-4 md:p-5 rounded-2xl w-full max-w-sm">
            <h2 className="text-base md:text-lg font-semibold mb-3 text-foreground">Delete All Expenses</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete all expenses? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="btn btn-ghost btn-xs md:btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="btn btn-error btn-xs md:btn-sm"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-morphism p-4 md:p-5 rounded-2xl w-full max-w-sm">
            <h2 className="text-base md:text-lg font-semibold mb-3 text-foreground">Edit Expense</h2>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  className="input input-bordered input-sm md:input-md w-full"
                  value={editingExpense.title}
                  onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
                  placeholder="Title"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="input input-bordered input-sm md:input-md w-full"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                />
              </div>
              <div>
                <select
                  className="select select-bordered select-sm md:select-md w-full"
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={editingExpense.isPercentage}
                  onChange={(e) => setEditingExpense({ ...editingExpense, isPercentage: e.target.checked })}
                />
                <span className="text-sm text-foreground">Calculate as percentage</span>
              </div>
              {editingExpense.isPercentage && (
                <div>
                  <input
                    type="number"
                    className="input input-bordered input-sm md:input-md w-full"
                    value={editingExpense.baseAmount || ''}
                    onChange={(e) => setEditingExpense({ ...editingExpense, baseAmount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    placeholder="Base Amount"
                  />
                </div>
              )}
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setEditingExpense(null)}
                  className="btn btn-ghost btn-xs md:btn-sm"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEdit(editingExpense)}
                  className="btn btn-primary btn-xs md:btn-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses; 