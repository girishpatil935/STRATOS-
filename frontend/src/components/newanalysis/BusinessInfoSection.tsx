import React from 'react';
import type { BusinessInfoFields } from '../../types/newAnalysis';

interface FieldConfig {
  key: keyof BusinessInfoFields;
  label: string;
  placeholder: string;
  hint?: string;
  multiline?: boolean;
  required?: boolean;
}

const FIELDS: FieldConfig[] = [
  {
    key: 'businessName',
    label: 'Business Name',
    placeholder: 'e.g. EcoRide Mobility',
    hint: 'The name of the company or venture being analyzed.',
    required: true,
  },
  {
    key: 'industry',
    label: 'Industry',
    placeholder: 'e.g. Electric Mobility, SaaS, Healthcare',
    hint: 'The sector your business operates in.',
  },
  {
    key: 'productService',
    label: 'Product or Service',
    placeholder: 'e.g. B2B EV fleet leasing platform',
    hint: 'What your business sells or delivers.',
  },
  {
    key: 'targetCustomer',
    label: 'Target Customer',
    placeholder: 'e.g. Logistics companies with 50–500 vehicles',
    hint: 'Who your primary customer or user is.',
  },
  {
    key: 'revenueOrBudget',
    label: 'Revenue / Budget',
    placeholder: 'e.g. INR 2 crore operating budget, pre-revenue',
    hint: 'Current revenue range or available budget for this initiative.',
  },
  {
    key: 'teamSize',
    label: 'Team Size',
    placeholder: 'e.g. 12 full-time, 4 contractors',
    hint: 'Number and type of people currently in the team.',
  },
  {
    key: 'competitors',
    label: 'Key Competitors',
    placeholder: 'e.g. BluSmart, Zypp Electric, OLA Electric',
    hint: 'Mention main competitors or alternatives in your market.',
  },
  {
    key: 'goals',
    label: 'Goals & Objectives',
    placeholder: 'e.g. Expand to 3 new cities in 12 months, achieve unit economics positive',
    hint: 'What the business is trying to achieve.',
    multiline: true,
  },
  {
    key: 'location',
    label: 'Location / Target Market',
    placeholder: 'e.g. India — currently in Pune, targeting Mumbai and Bengaluru',
    hint: 'Where your business operates or plans to operate.',
  },
];

interface BusinessInfoSectionProps {
  values: BusinessInfoFields;
  onChange: (field: keyof BusinessInfoFields, value: string) => void;
  showValidation: boolean;
}

export const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({
  values,
  onChange,
  showValidation,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-black">Business Information</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Provide details about your business. This context is sent to all six AI agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map(field => {
          const isRequired = field.required;
          const isEmpty    = !values[field.key].trim();
          const hasError   = isRequired && showValidation && isEmpty;

          return (
            <div
              key={field.key}
              className={field.multiline ? 'md:col-span-2' : ''}
            >
              <label
                htmlFor={`field-${field.key}`}
                className="block text-xs font-semibold text-black mb-1.5 tracking-wide"
              >
                {field.label}
                {isRequired && (
                  <span className="text-burgundy ml-1" aria-label="required">*</span>
                )}
              </label>

              {field.multiline ? (
                <textarea
                  id={`field-${field.key}`}
                  rows={3}
                  value={values[field.key]}
                  onChange={e => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={[
                    'w-full px-3.5 py-2.5 text-sm text-black placeholder-neutral-400 bg-white border rounded-xl outline-none transition-all duration-200 resize-none',
                    hasError
                      ? 'border-burgundy ring-1 ring-burgundy/30'
                      : 'border-neutral-200 focus:border-black focus:ring-1 focus:ring-black/10',
                  ].join(' ')}
                />
              ) : (
                <input
                  id={`field-${field.key}`}
                  type="text"
                  value={values[field.key]}
                  onChange={e => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={[
                    'w-full px-3.5 py-2.5 text-sm text-black placeholder-neutral-400 bg-white border rounded-xl outline-none transition-all duration-200',
                    hasError
                      ? 'border-burgundy ring-1 ring-burgundy/30'
                      : 'border-neutral-200 focus:border-black focus:ring-1 focus:ring-black/10',
                  ].join(' ')}
                />
              )}

              {field.hint && !hasError && (
                <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
                  {field.hint}
                </p>
              )}
              {hasError && (
                <p className="mt-1 text-[11px] text-burgundy font-medium">
                  {field.label} is required.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Required field note */}
      <p className="text-[11px] text-neutral-400">
        <span className="text-burgundy">*</span> Required field
      </p>
    </div>
  );
};

export default BusinessInfoSection;
