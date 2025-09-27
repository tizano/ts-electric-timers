import { timer, timerAction } from '@/db/schema/timer';
import { weddingEvent } from '@/db/schema/wedding-event';
import { authedProcedure, procedure, router } from '@/lib/trpc';
import { and, eq, gt } from 'drizzle-orm';
import z from 'zod';

// export const ee = new EventEmitter(); // Global EventEmitter pour notifications

export const timersRouter = router({
  listByWeddingEventId: procedure
    .input(z.object({ weddingEventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select()
        .from(timer)
        .innerJoin(timerAction, eq(timer.id, timerAction.timerId))
        .where(eq(timer.weddingEventId, input.weddingEventId))
        .orderBy(timer.orderIndex);
      return items;
    }),
  addTimeToTimer: authedProcedure
    .input(
      z.object({
        id: z.string(),
        additionalMinutes: z.number(),
        currentTimerDuration: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(timer)
        .set({
          durationMinutes: input.currentTimerDuration + input.additionalMinutes,
          lastModifiedById: ctx.session.user.id,
        })
        .where(eq(timer.id, input.id));
    }),
  completeTimer: authedProcedure
    .input(
      z.object({
        timerId: z.string(),
        weddingEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(timer)
        .set({ status: 'COMPLETED' })
        .where(eq(timer.id, input.timerId));

      const currentTimer = await ctx.db
        .select()
        .from(timer)
        .where(eq(timer.id, input.timerId))
        .limit(1)
        .then((res) => res[0]);

      if (!currentTimer) {
        throw new Error('Timer not found');
      }

      const nextTimer = await ctx.db
        .select()
        .from(timer)
        .where(
          and(
            eq(timer.weddingEventId, currentTimer.weddingEventId),
            gt(timer.orderIndex, currentTimer.orderIndex)
          )
        )
        .orderBy(timer.orderIndex)
        .limit(1)
        .then((res) => res[0]);

      if (!nextTimer) {
        throw new Error('No next timer found');
      }

      await ctx.db
        .update(weddingEvent)
        .set({ currentTimerId: nextTimer.id, updatedAt: new Date() })
        .where(eq(weddingEvent.id, currentTimer.weddingEventId));

      return { nextTimerId: nextTimer.id };
    }),
});
