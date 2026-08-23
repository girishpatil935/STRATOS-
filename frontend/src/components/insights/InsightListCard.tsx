import React from 'react';

/** Simple bullet-list card for string[] sections:
 *  market_insights, financial_insights, compliance_considerations,
 *  strategic_recommendations, assumptions, recommended_kpis
 */
interface InsightListCardProps {
  items: string[];
  emptyMessage: string;
  numbered?: boolean;
}

export const InsightListCard: React.FC<InsightListCardProps> = ({
  items,
  emptyMessage,
  numbered = false,
}) => {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
        <p className="text-sm text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <ul className="divide-y divide-neutral-100">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors duration-150"
          >
            <span className={[
              'flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mt-0.5',
              numbered
                ? 'bg-black text-white'
                : 'bg-neutral-100 text-neutral-500',
            ].join(' ')}>
              {numbered ? idx + 1 : '·'}
            </span>
            <p className="text-sm text-neutral-700 leading-relaxed">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightListCard;
