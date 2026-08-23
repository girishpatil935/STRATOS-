import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InsightSectionProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  id?: string;
}

/** Reusable section wrapper providing consistent header + spacing */
export const InsightSection: React.FC<InsightSectionProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  badge,
  children,
  id,
}) => (
  <section id={id} className="space-y-4 scroll-mt-6">
    {/* Section header */}
    <div className="flex items-start gap-3">
      <div className={['w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconBg].join(' ')}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-black">{title}</h2>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
    {children}
  </section>
);

export default InsightSection;
