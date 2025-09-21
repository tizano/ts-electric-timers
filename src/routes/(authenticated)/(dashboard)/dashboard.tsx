import { timerCollection } from '@/lib/collections';
import { useLiveQuery } from '@tanstack/react-db';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { TimerCard } from './-components/-timer-card';

/** eslint-disable-next-line */
export const Route = createFileRoute('/(authenticated)/(dashboard)/dashboard')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: timers, isLoading } = useLiveQuery((q) =>
    q.from({ timerCollection })
  );

  const renderTimers = () => {
    if (isLoading) {
      return <p className="text-gray-500">Loading timers...</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 md:grid-cols-3 lg:px-6 xl:grid-cols-4">
        {timers.map((timer) => (
          <TimerCard key={timer.id} timer={timer} />
        ))}
      </div>
    );
  };

  return <div>{renderTimers()}</div>;
}
