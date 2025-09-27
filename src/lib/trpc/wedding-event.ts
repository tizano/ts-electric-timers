import { timer } from '@/db/schema/timer';
import { updateWeddingEventSchema } from '@/db/schema/wedding-event';
import { authedProcedure, router } from '@/lib/trpc';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const weddingEventRouter = router({
  updateDemoWeddingEvent: authedProcedure
    .input(
      z.object({
        ...updateWeddingEventSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const timers = await ctx.db
        .select()
        .from(timer)
        .where(eq(timer.weddingEventId, input.id))
        .orderBy(timer.orderIndex);

      // Update all the timers with the new scheduledStartTime set only the date to now and keep the time
      const updateAllTimers = async () => {
        // scheduledStartTime: new Date('2025-10-25T16:00:00.000Z')
        // replace the date part of the scheduledStartTime with today's date before the T

        const now = new Date();
        const todayDateString = now.toISOString().split('T')[0]; // "2025-10-25"
        for (const t of timers) {
          if (t.scheduledStartTime) {
            const newScheduledStartTime = new Date(
              todayDateString +
                'T' +
                t.scheduledStartTime.toISOString().split('T')[1]
            );
            await ctx.db
              .update(timer)
              .set({
                scheduledStartTime: newScheduledStartTime,
              })
              .where(eq(timer.id, t.id));
          }
        }
      };
      await updateAllTimers();
    }),
});
