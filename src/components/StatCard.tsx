import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  percentage?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, percentage }) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    secondary: {
      bg: 'bg-secondary-50',
      text: 'text-secondary-700',
      iconBg: 'bg-secondary-100',
      iconColor: 'text-secondary-600',
    },
    accent: {
      bg: 'bg-accent-50',
      text: 'text-accent-700',
      iconBg: 'bg-accent-100',
      iconColor: 'text-accent-600',
    },
    success: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      iconBg: 'bg-success-100',
      iconColor: 'text-success-600',
    },
    warning: {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      iconBg: 'bg-warning-100',
      iconColor: 'text-warning-600',
    },
    error: {
      bg: 'bg-error-50',
      text: 'text-error-700',
      iconBg: 'bg-error-100',
      iconColor: 'text-error-600',
    },
  };
  
  const classes = colorClasses[color];
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg animate-slide-up">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${classes.bg}`}>
            <Icon className={`h-6 w-6 ${classes.iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{value.toLocaleString()}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {percentage !== undefined && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-500">Completion</span>
              <span className={`${classes.text} font-medium`}>{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`${classes.text.replace('text', 'bg')} h-1.5 rounded-full`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;