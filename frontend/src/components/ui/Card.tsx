import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'warm' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const variantClasses = {
  // 'warm' is a subtle neutral-50 surface
  default:  'bg-white border border-neutral-200 shadow-sm',
  warm:     'bg-neutral-50 border border-neutral-200',
  elevated: 'bg-white border border-neutral-200 shadow-md',
};

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
}) => {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'rounded-2xl transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default Card;
