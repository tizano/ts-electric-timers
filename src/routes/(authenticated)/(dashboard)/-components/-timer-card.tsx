import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Timer } from '@/db/schema/timer';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

export const TimerCard = ({
  timer,
  className,
}: {
  timer: Timer;
  className?: string;
}) => {
  const navigate = useNavigate();
  dayjs.extend(utc);
  console.log('Current time (UTC): ', dayjs.utc().format());
  console.log(
    'Event time (UTC) without dayjs: ',
    new Date(`${timer.scheduledStartTime}`).toUTCString()
  );
  console.log(
    'Event time (UTC): ',
    timer.scheduledStartTime?.toISOString(),
    dayjs.utc(timer.scheduledStartTime).isUTC()
  );
  console.log('**********************');

  const handleCardClick = () => {
    navigate({
      to: '/timers/$timerId/edit',
      params: { timerId: timer.id },
    });
  };

  return (
    <Card
      className={cn(
        className,
        timer.status === 'COMPLETED' &&
          'bg-green-100 opacity-60 pointer-events-none'
      )}
      key={timer.id}
      onClick={handleCardClick}
    >
      <CardHeader>
        {timer.scheduledStartTime !== null && (
          <CardDescription>
            <time>
              {dayjs
                .utc(timer.scheduledStartTime)
                .format('DD/MM/YYYY HH:mm:ss')}
            </time>
            <span>
              {timer.triggerOffsetMinutes &&
                ` (Offset: ${timer.triggerOffsetMinutes} mins)`}
            </span>
            <span>
              {timer.durationMinutes &&
                ` - Duration: ${timer.durationMinutes} mins`}
            </span>
          </CardDescription>
        )}
        <CardTitle className="text-md font-semibold">{timer.name}</CardTitle>
        <CardAction>
          <Badge variant={timer.status}>{timer.status}</Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Steady performance increase
        </div>
        <div className="text-muted-foreground">Meets growth projections</div>
      </CardFooter>
    </Card>
  );
};
