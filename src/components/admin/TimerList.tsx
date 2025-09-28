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
        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
        role="alert"
      >
        <p className="font-bold">Demo Mode Enabled</p>
      </div>
    );
  };

  const renderDemoButtons = () => {
    if (isDemo) {
      return (
        <Button
          onClick={() =>
            navigate({
              to: '/dashboard',
              params: { weddingEventId: 'wedding-event-1' },
            })
          }
        >
          Disable Demo Mode
        </Button>
      );
    }
    return (
      <Button
        onClick={() =>
          navigate({
            to: '/dashboard/$weddingEventId',
            params: { weddingEventId: 'wedding-event-demo' },
          })
        }
      >
        Enable Demo Mode
      </Button>
    );
  };

  return (
    <>
      {renderBannerDemoMode()}
      <div>{renderDemoButtons()}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {timersWithActions.map((timer) => (
          <TimerCard key={timer.id} timer={timer} actions={timer.actions} />
        ))}
      </div>
    </>
  );
}
