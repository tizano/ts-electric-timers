import { trpc } from '@/lib/trpc-client';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { TimerCard } from './-components/-timer-card';

/** eslint-disable-next-line */
export const Route = createFileRoute('/(authenticated)/(dashboard)/dashboard')({
  component: RouteComponent,
  ssr: false,
  loader: async () => {
    return trpc.timers.listByWeddingEventId.query({
      weddingEventId: 'wedding-event-1',
    });
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const data = Route.useLoaderData();

  // .from({ todo: todoCollection })
  //     .join({ list: listCollection }, ({ list, todo }) =>
  //       eq(list.id, todo.list_id)
  //     )
  //     .where(({ list }) => eq(list.active, true))
  //     .select(({ list, todo }) => ({
  //       id: todo.id,
  //       status: todo.status,
  //       text: todo.text,
  //       list_name: list.name,
  //     }))

  // timers.forEach((item, index) => {
  //   const startTime =
  //     item.timer.scheduledStartTime !== null
  //       ? item.timer.scheduledStartTime
  //       : 'N/A';
  //   console.log(
  //     `${index + 1}. ${startTime} - ${item.timer.name} (${item.timer.durationMinutes}min)`
  //   );
  // });
  // console.log('*********FIN Autre test *************');

  const renderTimers = () => {
    // if (isLoading) {
    //   return <p className="text-gray-500">Loading timers...</p>;
    // }
    console.log(data);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 md:grid-cols-3 lg:px-6 xl:grid-cols-4">
        {data.map((item) => (
          <TimerCard key={item.timer.id} timer={item.timer} />
        ))}
      </div>
    );
  };

  return <div>{renderTimers()}</div>;
}
