import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc-client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
  ssr: false,
  loader: async ({ route }) => {
    return trpc.timers.getCurrentTimerByWeddingEventId.query({
      weddingEventId:
        route.fullPath === '/demo' ? 'wedding-event-demo' : 'wedding-event-1',
    });
  },
});

function HomePage() {
  const navigate = Route.useNavigate();
  // const { currentTimer, isLoading } = usePusher();
  // video : https://us-west-2.graphassets.com/cm6cov50p0ooe06mweybhh1x1/cm6flfoqv35wf08mwecd41hmt

  // refresh data from loader
  const currentTimer = Route.useLoaderData();

  return (
    <main className="overflow-x-hidden relative">
      <section>
        <article>
          <video
            src="/assets/videos/universe.mp4"
            autoPlay
            muted
            loop
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          ></video>
          <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
          <div className="relative z-20 flex flex-col gap-8 items-center justify-center h-screen">
            <h1 className="text-6xl font-bold mb-4 text-center relative text-gray-50">
              Tony & Neka
            </h1>
            {currentTimer ? (
              <div className="text-center text-gray-200 space-y-2">
                <h2 className="text-2xl font-semibold">{currentTimer.name}</h2>
                {currentTimer.scheduledStartTime && (
                  <p className="text-lg">
                    Programmé pour:{' '}
                    {new Date(currentTimer.scheduledStartTime).toLocaleString(
                      'fr-FR'
                    )}
                  </p>
                )}
                {currentTimer.durationMinutes &&
                  currentTimer.durationMinutes > 0 && (
                    <p className="text-md opacity-80">
                      Durée: {currentTimer.durationMinutes} minutes
                    </p>
                  )}
                <p className="text-sm opacity-60">
                  Statut: {currentTimer.status || 'En attente'}
                </p>
              </div>
            ) : (
              <div className="text-xl text-gray-300">Aucun timer programmé</div>
            )}
            <div className="absolute top-0 right-0 p-4 group">
              <Button
                onClick={() =>
                  navigate({
                    to: '/dashboard/$weddingEventId',
                    params: { weddingEventId: 'wedding-event-1' },
                  })
                }
                variant={'outline'}
                className="cursor-pointer translate-x-[calc(100%+2rem)] group-hover:translate-x-0 transition-transform"
              >
                Go to dashboard
              </Button>
            </div>
            {/* {data?.timers && (
              <>
                <Timer timers={data.timers} />

                <div className="absolute bottom-16 right-16 min-w-[400px]">
                  <TimerList timers={data.timers} />
                </div>
              </>
            )} */}
          </div>
        </article>
      </section>
    </main>
  );
}
