// Shared presentation helpers for the Jobs feature.

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

export const WORKPLACES = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];

export const SALARY_PERIODS = [
  { value: 'yearly', label: 'Yearly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'hourly', label: 'Hourly' },
];

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
const PERIOD_SUFFIX = { yearly: 'year', monthly: 'month', hourly: 'hour' };

const labelFromList = (list, value) => list.find((item) => item.value === value)?.label || value;

export const jobTypeLabel = (value) => labelFromList(JOB_TYPES, value);
export const workplaceLabel = (value) => labelFromList(WORKPLACES, value);

// Compact money formatting: 60000 -> "$60k", 1500 -> "$1.5k", 80 -> "$80".
const formatAmount = (amount, symbol) => {
  if (amount >= 1000) {
    const k = amount / 1000;
    const rounded = Number.isInteger(k) ? k : Math.round(k * 10) / 10;
    return `${symbol}${rounded}k`;
  }
  return `${symbol}${amount}`;
};

// Returns a display string for a salary range, or '' when nothing usable is set.
export function formatSalary(salaryRange) {
  if (!salaryRange) return '';
  const { min, max, currency = 'USD', period = 'yearly' } = salaryRange;
  if (min == null && max == null) return '';

  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  const suffix = PERIOD_SUFFIX[period] || 'year';

  let amountText;
  if (min != null && max != null) amountText = `${formatAmount(min, symbol)} - ${formatAmount(max, symbol)}`;
  else if (min != null) amountText = `From ${formatAmount(min, symbol)}`;
  else amountText = `Up to ${formatAmount(max, symbol)}`;

  return `${amountText} / ${suffix}`;
}

// Tailwind classes for the colour-coded application status pill.
export const APPLICATION_STATUS_STYLES = {
  applied: 'bg-gray-100 text-gray-700',
  viewed: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  accepted: 'bg-green-100 text-green-700',
};

export const APPLICATION_STATUS_LABELS = {
  applied: 'Applied',
  viewed: 'Viewed',
  rejected: 'Rejected',
  accepted: 'Accepted',
};

export function getInitials(name) {
  return (
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

// Relative "posted" time: "now", "5m ago", "3h ago", "2d ago", "12 Jun".
export function formatPostedTime(value) {
  if (!value) return '';
  const diffMin = Math.floor((Date.now() - new Date(value)) / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}
