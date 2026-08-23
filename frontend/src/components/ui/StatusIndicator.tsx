import React from 'react';

type StatusType = 'online' | 'offline' | 'checking' | 'partial';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const dotClasses: Record<StatusType, string> = {
  online:   'bg-emerald-500',
  offline:  'bg-red-500',
  checking: 'bg-amber-400',
  partial:  'bg-amber-400',
};

const ringClasses: Record<StatusType, string> = {
  online:   'ring-emerald-200',
  offline:  'ring-red-200',
  checking: 'ring-amber-200',
  partial:  'ring-amber-200',
};

const labelClasses: Record<StatusType, string> = {
  online:   'text-emerald-600',
  offline:  'text-red-600',
  checking: 'text-amber-600',
  partial:  'text-amber-600',
};

const labelText: Record<StatusType, string> = {
  online:   'Online',
  offline:  'Offline',
  checking: 'Checking…',
  partial:  'Partial',
};

const dotSize  = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2' };
const ringSize = { sm: 'ring-1',       md: 'ring-2' };

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showLabel = true,
  size = 'sm',
  className = '',
}) => {
  const isAnimated = status === 'online' || status === 'checking';

  return (
    <span className={['inline-flex items-center gap-1.5', className].join(' ')}>
      <span
        className={[
          'rounded-full ring-offset-1',
          dotSize[size],
          dotClasses[status],
          ringClasses[status],
          ringSize[size],
          isAnimated ? 'animate-pulse-slow' : '',
        ].join(' ')}
      />
      {showLabel && (
        <span className={['text-xs font-medium', labelClasses[status]].join(' ')}>
          {label ?? labelText[status]}
        </span>
      )}
    </span>
  );
};

export default StatusIndicator;
