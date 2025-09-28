import type { TimerAction } from '@/db/schema/timer';
import StatusBadge from './StatusBadge';

type ActionListProps = { actions: TimerAction[] };

export default function ActionList({ actions }: ActionListProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map((action) => (
        <div
          className="flex justify-between items-center gap-2"
          key={action.id}
        >
          <span className="max-w-3/4 text-ellipsis overflow-hidden">
            {action.contentEn}
          </span>
          <StatusBadge
            status={action.executedAt ? 'EXECUTED' : 'NOT_EXECUTED'}
          />
        </div>
      ))}
    </div>
  );
}
