import { authClient } from '@/lib/auth-client';
import { timerCollection } from '@/lib/collections';
import { useLiveQuery } from '@tanstack/react-db';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute(`/_authenticated/`)({
  component: IndexRedirect,
  ssr: false,
  beforeLoad: async () => {
    const res = await authClient.getSession();
    if (!res.data?.session) {
      throw redirect({
        to: `/login`,
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
  },
  loader: async () => {
    await Promise.all([timerCollection.preload()]);

    return null;
  },
});

function IndexRedirect() {
  const navigate = useNavigate();
  const { data: timers, isLoading } = useLiveQuery((q) =>
    q.from({ timerCollection })
  );

  return (
    <div className="p-6">
      <div className="text-center">
        {!isLoading &&
          timers.length > 0 &&
          timers.map((timer) => (
            <div key={timer.id} className="mb-4 p-4 border rounded shadow">
              <h2 className="text-xl font-bold mb-2">{timer.name}</h2>
              <p className="text-gray-700">
                {timer.status === 'PENDING' ? 'En cours' : 'Not Completed'}
              </p>
            </div>
          ))}
        {isLoading && <p className="text-gray-500">Loading timers...</p>}
      </div>
    </div>
  );
}
