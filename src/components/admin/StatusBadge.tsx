import type { TIMER_STATUSES } from '@/db/schema/timer';
import { Badge } from '../ui/badge';

type TimerStatus =
  | (typeof TIMER_STATUSES)[number]
  | 'EXECUTED'
  | 'NOT_EXECUTED'
  | 'MANUAL'
  | 'PUNCTUAL';

type StatusBadgeProps = {
  status: TimerStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={status}>{status}</Badge>;
}
