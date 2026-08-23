import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  size?: 'sm' | 'md' | 'lg';
  tag?: React.ElementType;
  className?: string;
  eyebrow?: string;
}

const sizeClasses = {
  sm: { title: 'text-lg font-semibold', subtitle: 'text-sm' },
  md: { title: 'text-2xl font-bold',    subtitle: 'text-base' },
  lg: { title: 'text-3xl font-bold',    subtitle: 'text-lg' },
};

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align = 'left',
  size = 'md',
  tag: Tag = 'h2',
  className = '',
  eyebrow,
}) => {
  return (
    <div
      className={[
        'flex flex-col gap-1.5',
        align === 'center' ? 'items-center text-center' : 'items-start',
        className,
      ].join(' ')}
    >
      {eyebrow && (
        <span className="text-xs font-semibold tracking-widest uppercase text-burgundy">
          {eyebrow}
        </span>
      )}
      <Tag className={['text-black', sizeClasses[size].title].join(' ')}>
        {title}
      </Tag>
      {subtitle && (
        <p className={['text-neutral-500 leading-relaxed', sizeClasses[size].subtitle].join(' ')}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
