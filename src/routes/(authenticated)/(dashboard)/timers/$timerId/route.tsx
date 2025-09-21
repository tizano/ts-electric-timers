import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/(dashboard)/timers/$timerId'
)({
  component: RouteComponent,
  beforeLoad: () => {
    redirect({ to: '/timers/$timerId/edit', params: { timerId: '$timerId' } });
  },
});

function RouteComponent() {
  return <div>Timer Edit Page</div>;
}
