import { selectTimerSchema } from '@/db/schema/timer';
import { trpc } from '@/lib/trpc-client';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';

export const timerCollection = createCollection(
  electricCollectionOptions({
    id: 'timers',
    shapeOptions: {
      url: new URL(
        '/api/timers',
        typeof window !== `undefined`
          ? window.location.origin
          : process.env.CORS_ORIGIN!
      ).toString(),
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
      params: {
        table: 'timer',
      },
    },
    schema: selectTimerSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newTimer } = transaction.mutations[0];
      const result = await trpc.timers.create.mutate(newTimer);
      return { txid: result.txid };
    },
    // Add onUpdate, onDelete as needed
  })
);
