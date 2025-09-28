import TimerList from '@/components/admin/TimerList';
import { trpc } from '@/lib/trpc-client';
import { createFileRoute } from '@tanstack/react-router';

/** eslint-disable-next-line */
export const Route = createFileRoute('/(authenticated)/dashboard/')({
  component: RouteComponent,
  ssr: false,
  loader: async () => {
    return trpc.timers.listByWeddingEventId.query({
      weddingEventId: 'wedding-event-1',
    });
  },
});

function RouteComponent() {
  const timersWithActions = Route.useLoaderData();

  return <TimerList timersWithActions={timersWithActions} />;
}
