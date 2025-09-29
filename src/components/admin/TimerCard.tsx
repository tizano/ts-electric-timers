import { type Timer, type TimerAction } from '@/db/schema/timer';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { trpc } from '@/lib/trpc-client';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { Calendar, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import TimerCountdown from '../timer/TimerCountdown';
import { Button } from '../ui/button';
import ActionList from './ActionList';
import StatusBadge from './StatusBadge';

type TimerCardProps = {
  timerData: Timer;
  actionsData: TimerAction[];
  isDemo?: boolean;
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function TimerCard({
  timerData,
  actionsData,
  isDemo,
}: TimerCardProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!timerData.scheduledStartTime) return;
    const calculateTimeLeft = () => {
      const targetTime =
        timerData.scheduledStartTime !== null
          ? new Date(timerData.scheduledStartTime).getTime()
          : 0;
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false); // TODO : gérer dans les actions pour verifier que chaque action a été jouée et marquée comme exécutée avec pusher, sachant que dans les actions on peut avoir displayDurationSec pour garder le timer affiché clignotant avec les temps a 0
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true); // TODO : gérer dans les actions pour verifier que chaque action a été jouée et marquée comme exécutée avec pusher, sachant que dans les actions on peut avoir displayDurationSec pour garder le timer affiché clignotant avec les temps a 0
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [timerData.scheduledStartTime]);

  const isManualTimer =
    timerData.durationMinutes === 0 && timerData.scheduledStartTime === null;

  const isPunctualTimer =
    timerData.durationMinutes === 0 && timerData.scheduledStartTime !== null;

  const renderStatusBadge = (status: Timer['status']) => {
    return (
      <div className="flex justify-center gap-2">
        {isManualTimer && <StatusBadge status="MANUAL" />}
        {isPunctualTimer && <StatusBadge status="PUNCTUAL" />}
        {!isManualTimer && !isPunctualTimer && <StatusBadge status={status} />}
      </div>
    );
  };

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toUTCString();
  };

  return (
    <Card
      className={cn(
        'w-full max-w-2xl mx-auto',
        isDemo && 'pt-0 overflow-hidden'
      )}
    >
      {isDemo && (
        <div className="bg-yellow-100  text-amber-700 p-2 mb-0 flex items-center justify-center text-center">
          <p className="font-bold">Demo</p>
        </div>
      )}
      <CardHeader className="text-center">
        {timerData.name && (
          <CardTitle className="text-2xl font-bold text-balance">
            {timerData.name}
          </CardTitle>
        )}
        {timerData.scheduledStartTime && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {formatDate(timerData.scheduledStartTime)}
            </span>
          </div>
        )}
        {timerData.durationMinutes !== null &&
          timerData.durationMinutes > 0 && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {timerData.durationMinutes} minutes
              </span>
            </div>
          )}
        {isManualTimer && (
          <div className="text-sm text-muted-foreground flex flex-col items-center mt-4">
            <i>Manual Timer (no scheduled start or duration)</i>
            <Button
              className="mt-1"
              onClick={() => {
                // Trigger the action for the manual timer
                trpc.timers.updateTimer.mutate({ id: timerData.id });
              }}
            >
              Trigger action
            </Button>
          </div>
        )}
        {isPunctualTimer && (
          <div className="text-sm text-muted-foreground mt-4">
            <i>Punctual Timer (no duration)</i>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Countdown Display */}
        <div className="text-center">
          {isExpired ? (
            <div className="text-2xl font-bold text-primary">
              Event Started !
            </div>
          ) : (
            <TimerCountdown timeLeft={timeLeft} />
          )}
        </div>

        {/* Status Badge */}
        {renderStatusBadge(timerData.status)}

        {/* Actions */}
        <ActionList actions={actionsData} />
      </CardContent>
      <CardFooter className="flex-1 items-end">
        <Button
          className="mt-1 w-full"
          onClick={() => {
            // Trigger the action for the manual timer
            navigate({ to: `/dashboard/timers/${timerData.id}` });
          }}
        >
          Edit the timer
        </Button>
      </CardFooter>
    </Card>
  );
}
