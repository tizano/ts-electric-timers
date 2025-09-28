import type { RouterOutputs } from '@/lib/trpc-client';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';
import TimerCard from './TimerCard';

type TimerListProps = {
  timersWithActions: RouterOutputs['timers']['listByWeddingEventId'];
  isDemo?: boolean;
};
export default function TimerList({
  timersWithActions,
  isDemo,
}: TimerListProps) {
  const navigate = useNavigate();

  const renderBannerDemoMode = () => {
    if (!isDemo) {
      return null;
    }
    return (
      <div
        className="bg-yellow-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 flex items-center justify-between"
        role="alert"
      >
        <p className="font-bold">Demo Mode Enabled</p>
        <p>
          <span className="font-normal">
            Go to <strong>/demo</strong> on the main app
          </span>
        </p>
        <Button
          onClick={() =>
            navigate({
              to: '/dashboard',
              params: { weddingEventId: 'wedding-event-1' },
            })
          }
          className="cursor-pointer"
        >
          Disable Demo Mode
        </Button>
      </div>
    );
  };

  const renderDemoButtons = () => {
    if (isDemo) {
      return null;
    }
    return (
      <Button
        onClick={() =>
          navigate({
            to: '/dashboard/$weddingEventId',
            params: { weddingEventId: 'wedding-event-demo' },
          })
        }
        variant={'destructive'}
        className="cursor-pointer"
      >
        Enable Demo Mode
      </Button>
    );
  };

  return (
    <>
      {renderBannerDemoMode()}
      <div className="mb-4">{renderDemoButtons()}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {timersWithActions.map((timer) => (
          <TimerCard key={timer.id} timer={timer} actions={timer.actions} />
        ))}
      </div>
    </>
  );
}
