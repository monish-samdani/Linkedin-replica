import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_STYLES } from '../utils';

export default function ApplicationStatusChip({ status }) {
  if (!status) return null;
  const styles = APPLICATION_STATUS_STYLES[status] || APPLICATION_STATUS_STYLES.applied;
  const label = APPLICATION_STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
}
