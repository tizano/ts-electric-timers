import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { TimerAction } from '@/db/schema/timer';
import StatusBadge from './StatusBadge';

type ActionListProps = { actions: TimerAction[] };

export default function ActionList({ actions }: ActionListProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-gray-100 rounded"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-gray-100 w-full text-left p-2 rounded hover:no-underline cursor-pointer">
          <div className="flex gap-2 items-center">
            ACTIONS{' '}
            <span className="inline-flex items-center justify-center bg-blue-200 text-blue-800 rounded-full w-6 h-6 text-sm font-medium">
              {actions.length}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4 p-2">
            {actions.map((action, index) => (
              <div
                className="relative flex justify-between items-center gap-2 after:content-[''] after:w-full after:absolute after:left-0 after:h-px after:-bottom-2  after:bg-gray-500/30 last:after:hidden"
                key={action.id}
              >
                <div className="max-w-3/4 flex flex-col gap-1 text-gray-700">
                  <span>{action.type}</span>
                  <span>{action.url}</span>
                </div>
                <StatusBadge
                  status={action.executedAt ? 'EXECUTED' : 'NOT_EXECUTED'}
                />
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
