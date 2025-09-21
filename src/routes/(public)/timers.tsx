import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/timers')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(public)/timers"!</div>;
}
