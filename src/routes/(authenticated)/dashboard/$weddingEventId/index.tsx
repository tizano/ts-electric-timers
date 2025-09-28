import TimerList from '@/components/admin/TimerList';
import { trpc } from '@/lib/trpc-client';
import { createFileRoute } from '@tanstack/react-router';

/** eslint-disable-next-line */
export const Route = createFileRoute(
  '/(authenticated)/dashboard/$weddingEventId/'
)({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    console.log('Loader params:', params);

    return trpc.timers.listByWeddingEventId.query({
      weddingEventId: params.weddingEventId,
    });
  },
});

function RouteComponent() {
  const timersWithActions = Route.useLoaderData();

  return <TimerList timersWithActions={timersWithActions} isDemo />;
}
