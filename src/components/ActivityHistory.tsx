import React from 'react';
import { useStore } from '../store/useStore';
import {
  ClockIcon,
  TrashIcon,
  PlusIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowsRightLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ActivityHistoryProps {
  compact?: boolean;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ compact = false }) => {
  const { activityHistory, clearHistory, cashBalance } = useStore();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <PlusIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'delete':
        return <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'update':
        return <PencilSquareIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'convert':
        return <ArrowsRightLeftIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <SparklesIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/50 dark:border-emerald-800/30';
      case 'delete':
        return 'bg-red-50 dark:bg-red-950/50 border-red-200/50 dark:border-red-800/30';
      case 'update':
        return 'bg-blue-50 dark:bg-blue-950/50 border-blue-200/50 dark:border-blue-800/30';
      case 'convert':
        return 'bg-purple-50 dark:bg-purple-950/50 border-purple-200/50 dark:border-purple-800/30';
      default:
        return 'bg-gray-50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/30';
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800';
      case 'delete':
        return 'bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800';
      case 'update':
        return 'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800';
      case 'convert':
        return 'bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800';
    }
  };

  const formatAmount = (activity: any) => {
    if (!activity.amount) return null;

    if (activity.description.includes('%')) {
      const percentageAmount = activity.amount;
      const actualAmount = (cashBalance.amount * percentageAmount) / 100;
      return (
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-700 dark:text-primary-300">
            {percentageAmount}%
          </span>
          <span className="text-xs text-muted-foreground">
            ≈ {cashBalance.currency} {actualAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      );
    }

    if (activity.currency) {
      return (
        <div className="mt-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-700 dark:text-primary-300">
            {activity.currency} {activity.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      );
    }

    return null;
  };

  if (activityHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <ClockIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">No activity yet</h3>
        <p className="text-xs text-muted-foreground">Your financial activities will appear here</p>
      </div>
    );
  }

  const displayedActivities = compact ? activityHistory.slice(0, 5) : activityHistory;

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Activity History</h2>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-700 dark:text-primary-300">
              {activityHistory.length}
            </span>
          </div>
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all duration-200"
            title="Clear History"
          >
            <TrashIcon className="w-4 h-4" />
            Clear
          </button>
        </div>
      )}

      <div className={`space-y-3 ${compact ? 'max-h-[300px]' : 'max-h-[500px]'} overflow-y-auto pr-2`}>
        {displayedActivities.map((activity, index) => (
          <div
            key={activity.id}
            className={`group relative rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${getActivityBgColor(activity.type)}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg border ${getIconBgColor(activity.type)} group-hover:scale-110 transition-transform duration-200`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {activity.description}
                </p>
                {formatAmount(activity)}
                <div className="flex items-center gap-2 mt-2">
                  <ClockIcon className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </div>
        ))}
      </div>

      {compact && activityHistory.length > 5 && (
        <div className="text-center pt-3 border-t border-gray-200/50 dark:border-white/[0.06]">
          <p className="text-xs text-muted-foreground">
            Showing 5 of {activityHistory.length} activities
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory; 