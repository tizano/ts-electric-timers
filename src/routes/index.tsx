import { Button } from '@/components/ui/button';
import { env } from '@/env/client';
import { createFileRoute } from '@tanstack/react-router';
import Pusher from 'pusher-js';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const navigate = Route.useNavigate();
  Pusher.logToConsole = true;

  const pusher = new Pusher(env.VITE_PUSHER_KEY, {
    cluster: env.VITE_PUSHER_CLUSTER,
  });

  const channel = pusher.subscribe('my-channel');
  channel.bind('my-event', function (data: unknown) {
    console.log(data);
  });
  // video : https://us-west-2.graphassets.com/cm6cov50p0ooe06mweybhh1x1/cm6flfoqv35wf08mwecd41hmt

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
