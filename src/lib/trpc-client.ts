import type { AppRouter } from '@/routes/api/trpc/$';
import {
  createTRPCProxyClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from '@trpc/client';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink(),
    splitLink({
      // uses the httpSubscriptionLink for subscriptions
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({
        url: `/api/trpc`,
        eventSourceOptions: () => ({
          withCredentials: true, // Si auth
        }),
      }),
      false: httpBatchLink({
        url: '/api/trpc',
        async headers() {
          return {
            cookie: typeof document !== 'undefined' ? document.cookie : '',
          };
        },
      }),
    }),
  ],
});
