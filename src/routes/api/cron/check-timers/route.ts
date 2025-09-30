import { timerService } from '@/lib/services/timer-service';
import { createServerFileRoute } from '@tanstack/react-start/server';

const serve = async ({ request }: { request: Request }) => {
  // Vérifier l'authentification du cron
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const result = await timerService.checkAndStartAllPunctualTimers();

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erreur cron check-timers:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

export const ServerRoute = createServerFileRoute(
  '/api/cron/check-timers'
).methods({
  GET: serve,
  OPTIONS: serve,
});
