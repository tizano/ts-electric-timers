import type { Timer, TimerAction } from '@/db/schema/timer';
import { trpc } from '@/lib/trpc-client';
import ActionList from './ActionList';
import StatusBadge from './StatusBadge';

// import dayjs from 'dayjs';
// import duration from 'dayjs/plugin/duration';
// import timezone from 'dayjs/plugin/timezone';
// import utc from 'dayjs/plugin/utc';

// dayjs.extend(utc);
// dayjs.extend(timezone);
// dayjs.extend(duration);

type TimerCardProps = {
  timer: Timer;
  actions: TimerAction[];
};

export default function TimerCard({ timer, actions }: TimerCardProps) {
  return (
    <div className="p-4 rounded-lg bg-white/80 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-semibold">{timer.name}</h3>
          {timer.durationMinutes && timer.durationMinutes > 0 && (
            <div className="text-sm text-gray-600">
              Duration: {timer.durationMinutes} min
            </div>
          )}
          {timer.scheduledStartTime && (
            <div className="text-sm text-gray-600">
              {new Date(timer.scheduledStartTime).toISOString()}
            </div>
          )}
          <button
            onClick={() =>
              trpc.timers.addTimeToTimer.mutate({
                id: timer.id,
                additionalMinutes: 5,
                currentTimerDuration: timer.durationMinutes!,
              })
            }
          >
            Click me to add time
          </button>
        </div>
      </div>
      <ActionList actions={actions} />
      <div className="mt-2">
        <StatusBadge status={timer.status} />
      </div>
    </div>
  );
}
