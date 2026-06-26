import { getInitials } from '../utils';

const PALETTE = [
  'bg-brand-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-600',
  'bg-indigo-500',
];

// Deterministic colour so the same company always gets the same fallback avatar.
const colorFor = (name = '') => {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
};

export default function CompanyLogo({ logo, companyName, size = 'h-12 w-12', textSize = 'text-sm' }) {
  if (logo) {
    return <img src={logo} alt={companyName} className={`${size} rounded-lg border border-gray-200 object-cover`} />;
  }
  return (
    <div
      className={`${size} ${colorFor(companyName)} flex items-center justify-center rounded-lg font-bold text-white ${textSize}`}
    >
      {getInitials(companyName)}
    </div>
  );
}
