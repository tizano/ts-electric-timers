import type { TimerAction } from '@/db/schema/timer';
import { Image, ImagePlay, Video, Volume2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

type ActionListProps = { actions: TimerAction[] };

export default function ActionList({ actions }: ActionListProps) {
  if (!actions.length) return null;

  const renderActionIcon = (action: TimerAction) => {
    switch (action.type) {
      case 'VIDEO':
        return <Video className="w-5 h-5 text-primary" />;
      case 'SOUND':
        return <Volume2 className="w-5 h-5 text-primary" />;
      case 'IMAGE':
        return <Image className="w-5 h-5 text-primary" />;
      case 'GALLERY':
        return <ImagePlay className="w-5 h-5 text-primary" />;
      default:
        return null;
    }
  };
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-center">Scheduled Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex gap-3 p-3 rounded-lg bg-muted/50"
          >
            <div className="mt-1">{renderActionIcon(action)}</div>
            <div className="flex-1 relative">
              <div className="font-medium pr-28">{action.contentEn}</div>
              <div className="text-sm text-muted-foreground flex flex-col gap-1">
                <span>
                  {action.type} • {action.triggerType}
                  {action.displayDurationSec && (
                    <span> • {action.displayDurationSec}s</span>
                  )}
                </span>
                <span>{action.url}</span>
              </div>
              <div className="absolute top-0 right-0">
                <StatusBadge
                  status={action.executedAt ? 'EXECUTED' : 'NOT_EXECUTED'}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
