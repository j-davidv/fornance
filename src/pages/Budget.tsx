import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  PlusIcon,
  ChartPieIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';

interface BudgetCategory {
  name: string;
  percentage: number;
  color: string;
}

const Budget = () => {
  const {
    budgetPlans,
    activeBudgetPlan,
    cashBalance,
    createBudgetPlan,
    updateBudgetPlan,
    deleteBudgetPlan,
    setActiveBudgetPlan,
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planName, setPlanName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { name: 'Savings', percentage: 30, color: '#10B981' },
    { name: 'Living Expenses', percentage: 40, color: '#F59E0B' },
    { name: 'Entertainment', percentage: 15, color: '#EF4444' },
    { name: 'Emergency Fund', percentage: 15, color: '#3B82F6' },
  ]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0);

  const defaultColors = [
    '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  useEffect(() => {
    if (totalAmount && !isNaN(parseFloat(totalAmount))) {
      const amount = parseFloat(totalAmount);
      setCategories(prev => prev.map(cat => ({
        ...cat,
        amount: (amount * cat.percentage) / 100
      })));
    }
  }, [totalAmount]);

  const resetForm = () => {
    setPlanName('');
    setTotalAmount('');
    setCategories([
      { name: 'Savings', percentage: 30, color: '#10B981' },
      { name: 'Living Expenses', percentage: 40, color: '#F59E0B' },
      { name: 'Entertainment', percentage: 15, color: '#EF4444' },
      { name: 'Emergency Fund', percentage: 15, color: '#3B82F6' },
    ]);
    setEditingPlan(null);
  };

  const handleCreatePlan = () => {
    if (!planName.trim()) {
      toast.error('Please enter a plan name');
      return;
    }

    if (!totalAmount || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error('Total percentage must equal 100%');
      return;
    }

    if (categories.length === 0) {
      toast.error('Please add at least one category');
      return;
    }

    try {
      createBudgetPlan(
        planName,
        parseFloat(totalAmount),
        categories.map(cat => ({
          name: cat.name,
          percentage: cat.percentage,
          color: cat.color,
        }))
      );

      toast.success('Budget plan created successfully!');
      setIsCreating(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create budget plan');
      console.error('Error creating budget plan:', error);
    }
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setTotalAmount(plan.totalAmount.toString());
    setCategories(plan.categories.map((cat: any) => ({
      name: cat.name,
      percentage: cat.percentage,
      color: cat.color,
    })));
    setIsEditing(true);
  };

  const handleUpdatePlan = () => {
    if (!planName.trim()) {
      toast.error('Please enter a plan name');
      return;
    }

    if (!totalAmount || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error('Total percentage must equal 100%');
      return;
    }

    if (categories.length === 0) {
      toast.error('Please add at least one category');
      return;
    }

    try {
      const updatedCategories = categories.map((cat, index) => {
        const existingCategory = editingPlan.categories.find((existing: any) => existing.name === cat.name);
        return {
          id: existingCategory?.id || crypto.randomUUID(),
          name: cat.name,
          percentage: cat.percentage,
          color: cat.color,
          amount: (parseFloat(totalAmount) * cat.percentage) / 100,
        };
      });

      updateBudgetPlan(editingPlan.id, {
        name: planName,
        totalAmount: parseFloat(totalAmount),
        categories: updatedCategories,
      });

      toast.success('Budget plan updated successfully!');
      setIsEditing(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to update budget plan');
      console.error('Error updating budget plan:', error);
    }
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      toast.error('Category already exists');
      return;
    }

    const remainingPercentage = Math.max(0, 100 - totalPercentage);
    const newCategory: BudgetCategory = {
      name: newCategoryName,
      percentage: remainingPercentage,
      color: defaultColors[categories.length % defaultColors.length],
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategoryPercentage = (index: number, percentage: number) => {
    const newCategories = [...categories];
    newCategories[index].percentage = Math.max(0, Math.min(100, percentage));
    setCategories(newCategories);
  };

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this budget plan?')) {
      deleteBudgetPlan(planId);
      toast.success('Budget plan deleted');
    }
  };

  const chartData = activeBudgetPlan ? activeBudgetPlan.categories.map(cat => ({
    name: cat.name,
    value: cat.amount,
    percentage: cat.percentage,
    color: cat.color,
  })) : [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {activeBudgetPlan?.currency} {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 max-w-[1400px] mt-12">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 border border-blue-200 dark:border-blue-800">
            <ChartPieIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Budget Planning</h1>
            <p className="text-sm text-muted-foreground">Create and manage your budget plans</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Budget Plans List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardDocumentListIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Your Budget Plans</h2>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-700 dark:text-primary-300">
              {budgetPlans.length}
            </span>
          </div>

          {budgetPlans.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white/80 dark:bg-gray-900/40 border border-gray-200/50 dark:border-white/[0.06]">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <ChartPieIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">No budget plans yet</h3>
              <p className="text-xs text-muted-foreground mb-4">Create your first budget plan to get started</p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Create Plan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {budgetPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`group p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    activeBudgetPlan?.id === plan.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
                      : 'bg-white/80 dark:bg-gray-900/40 border-gray-200/50 dark:border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.currency} {plan.totalAmount.toLocaleString()} • {plan.categories.length} categories
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveBudgetPlan(activeBudgetPlan?.id === plan.id ? null : plan.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          activeBudgetPlan?.id === plan.id
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                        title={activeBudgetPlan?.id === plan.id ? 'Hide chart' : 'View chart'}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit plan"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete plan"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart Visualization */}
        <div className="rounded-2xl bg-white/80 dark:bg-gray-900/40 border border-gray-200/50 dark:border-white/[0.06] p-6">
          <div className="flex items-center gap-3 mb-6">
            <ChartPieIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Budget Visualization</h2>
          </div>

          {activeBudgetPlan ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">{activeBudgetPlan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Total Budget: {activeBudgetPlan.currency} {activeBudgetPlan.totalAmount.toLocaleString()}
                </p>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {activeBudgetPlan.categories.map((category, index) => (
                  <div key={category.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {activeBudgetPlan.currency} {category.amount.toLocaleString()} ({category.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <ChartPieIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">No plan selected</h3>
              <p className="text-xs text-muted-foreground">Select a budget plan to view the chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Budget Plan Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <CalculatorIcon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Create Budget Plan</h2>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Plan Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., Monthly Budget"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Total Amount</label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter total budget amount"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Budget Categories</h3>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    Math.abs(totalPercentage - 100) < 0.01 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                  }`}>
                    Total: {totalPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => {
                            const newCategories = [...categories];
                            newCategories[index].name = e.target.value;
                            setCategories(newCategories);
                          }}
                          className="w-full text-sm font-medium bg-transparent text-foreground focus:outline-none"
                          placeholder="Category name"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={category.percentage}
                          onChange={(e) => updateCategoryPercentage(index, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                        <button
                          onClick={() => removeCategory(index)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary"
                    placeholder="Add new category"
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <button
                    onClick={addCategory}
                    className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  disabled={Math.abs(totalPercentage - 100) > 0.01 || categories.length === 0}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
                >
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Plan Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 border border-blue-200 dark:border-blue-800">
                  <PencilSquareIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Edit Budget Plan</h2>
              </div>
              <button
                onClick={() => {
                  setIsEditing(false);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Plan Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., Monthly Budget"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Total Amount</label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter total budget amount"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Budget Categories</h3>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    Math.abs(totalPercentage - 100) < 0.01 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                  }`}>
                    Total: {totalPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => {
                            const newCategories = [...categories];
                            newCategories[index].name = e.target.value;
                            setCategories(newCategories);
                          }}
                          className="w-full text-sm font-medium bg-transparent text-foreground focus:outline-none"
                          placeholder="Category name"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={category.percentage}
                          onChange={(e) => updateCategoryPercentage(index, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                        <button
                          onClick={() => removeCategory(index)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary"
                    placeholder="Add new category"
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <button
                    onClick={addCategory}
                    className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePlan}
                  disabled={Math.abs(totalPercentage - 100) > 0.01 || categories.length === 0}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
                >
                  Update Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget; 