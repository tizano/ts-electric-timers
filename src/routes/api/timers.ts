import { auth } from '@/lib/auth/auth';
import { prepareElectricUrl, proxyElectricRequest } from '@/lib/electric-proxy';
import { createServerFileRoute } from '@tanstack/react-start/server';

const serve = async ({ request }: { request: Request }) => {
  const userSession = await auth.api.getSession({ headers: request.headers });
  if (!userSession) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const originUrl = prepareElectricUrl(request.url);
  originUrl.searchParams.set('table', 'timer');
  // const filter = `createdById = '${userSession.user.id}'`;
  // originUrl.searchParams.set('where', filter);

  return proxyElectricRequest(originUrl);
};

export const ServerRoute = createServerFileRoute('/api/timers').methods({
  GET: serve,
});
