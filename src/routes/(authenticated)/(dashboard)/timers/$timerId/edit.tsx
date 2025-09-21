import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(authenticated)/(dashboard)/timers/$timerId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/_authenticatedLayout/(dashboard)/timers/$timerId/edit"!</div>
  )
}
