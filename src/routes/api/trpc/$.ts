import { db } from '@/db';
import { auth } from '@/lib/auth/auth';
import { router } from '@/lib/trpc';
import { timersRouter } from '@/lib/trpc/timers';
import { usersRouter } from '@/lib/trpc/users';
import { createServerFileRoute } from '@tanstack/react-start/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const appRouter = router({
  users: usersRouter,
  timers: timersRouter,
});

export type AppRouter = typeof appRouter;

const serve = ({ request }: { request: Request }) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: async () => ({
      db,
      session: await auth.api.getSession({ headers: request.headers }),
    }),
  });
};

export const ServerRoute = createServerFileRoute('/api/trpc/$').methods({
  GET: serve,
  POST: serve,
});
