import type { TIMER_STATUSES } from '@/db/schema/timer';
import { cn } from '@/lib/utils';

type TimerStatus =
  | (typeof TIMER_STATUSES)[number]
  | 'EXECUTED'
  | 'NOT_EXECUTED';

type StatusBadgeProps = {
  status: TimerStatus;
};

const COLORS: Record<TimerStatus, string> = {
  PENDING: 'bg-gray-200 text-gray-800',
  RUNNING: 'bg-blue-200 text-blue-800',
  COMPLETED: 'bg-green-200 text-green-800',
  EXECUTED: 'bg-green-400 text-green-800',
  NOT_EXECUTED: 'bg-gray-200 text-gray-800',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0',
        COLORS[status]
      )}
    >
      {status}
    </span>
  );
}
