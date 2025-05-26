import React from 'react';
import { useStore } from '../store/useStore';
import {
  ClockIcon,
  TrashIcon,
  ArrowPathIcon,
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
        return '➕';
      case 'delete':
        return '❌';
      case 'update':
        return '✏️';
      case 'convert':
        return '💱';
      default:
        return '📝';
    }
  };

  const formatAmount = (activity: any) => {
    if (!activity.amount) return null;

    if (activity.description.includes('%')) {
      const percentageAmount = activity.amount;
      const actualAmount = (cashBalance.amount * percentageAmount) / 100;
      return (
        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
          {percentageAmount}% (≈ {cashBalance.currency} {actualAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })})
        </p>
      );
    }

    if (activity.currency) {
      return (
        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
          {activity.currency} {activity.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      );
    }

    return null;
  };

  if (activityHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ClockIcon className="w-8 h-8 mx-auto mb-2" />
        <p>No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Activity History</h2>
        <button
          onClick={clearHistory}
          className="btn btn-ghost btn-sm gap-2"
          title="Clear History"
        >
          <TrashIcon className="w-4 h-4" />
          Clear
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {activityHistory.map((activity) => (
          <div
            key={activity.id}
            className="glass-morphism p-3 rounded-lg flex items-start gap-3"
          >
            <span className="text-xl" role="img" aria-label={activity.type}>
              {getActivityIcon(activity.type)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.description}</p>
              {formatAmount(activity)}
              <p className="text-xs text-muted-foreground">
                {format(new Date(activity.timestamp), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityHistory; 