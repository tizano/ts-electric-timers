import { authQueryOptions } from '@/lib/auth/queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Header } from './(dashboard)/-components/-header';

export const Route = createFileRoute(`/(authenticated)`)({
  component: DashboardLayout,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (!user) {
      throw redirect({ to: '/login' });
    }
    // re-return to update type as non-null for child routes
    return { user };
  },
});

function DashboardLayout() {
  // const { user } = Route.useRouteContext();
  const { data: user } = useSuspenseQuery(authQueryOptions());

  return (
    <main className="min-h-screen bg-gray-100">
      {user && <Header user={user} />}
      <div className="p-6">
        <Outlet />
      </div>
    </main>
  );
}
