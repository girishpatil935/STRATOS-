import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-neutral-100 text-neutral-700 border border-neutral-200',
  success:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning:  'bg-amber-50 text-amber-700 border border-amber-200',
  danger:   'bg-burgundy-50 text-burgundy border border-burgundy-100',
  info:     'bg-neutral-100 text-neutral-600 border border-neutral-200',
  ai:       'bg-black text-white border border-black',
  neutral:  'bg-neutral-50 text-neutral-500 border border-neutral-200',
};

const dotColors: Record<BadgeVariant, string> = {
  default:  'bg-neutral-400',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-burgundy',
  info:     'bg-neutral-400',
  ai:       'bg-white',
  neutral:  'bg-neutral-400',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-1 text-xs rounded-lg',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={[
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColors[variant],
          ].join(' ')}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
