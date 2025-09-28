import type { AppRouter } from '@/routes/api/trpc/$';
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { transformer } from './utils';

export type RouterInputs = inferRouterInputs<AppRouter>;

// Infer the output types for all procedures in your AppRouter
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink(),
    httpBatchLink({
      url: '/api/trpc',
      async headers() {
        return {
          cookie: typeof document !== 'undefined' ? document.cookie : '',
        };
      },
      transformer: transformer,
    }),
    // splitLink({
    //   // uses the httpSubscriptionLink for subscriptions
    //   condition: (op) => op.type === 'subscription',
    //   true: httpSubscriptionLink({
    //     url: `/api/trpc`,
    //     eventSourceOptions: () => ({
    //       withCredentials: true, // Si auth
    //     }),
    //   }),
    //   false: httpBatchLink({
    //     url: '/api/trpc',
    //     async headers() {
    //       return {
    //         cookie: typeof document !== 'undefined' ? document.cookie : '',
    //       };
    //     },
    //   }),
    // }),
  ],
});
