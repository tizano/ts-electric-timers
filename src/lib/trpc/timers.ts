import { db } from '@/db';
import { timer, timerAction, updateTimerSchema } from '@/db/schema/timer';
import { weddingEvent } from '@/db/schema/wedding-event';
import { env } from '@/env/server';
import { authedProcedure, procedure, router } from '@/lib/trpc';
import { and, asc, eq, gt } from 'drizzle-orm';
import Pusher from 'pusher';
import z from 'zod';
import { CHANNEL, TIMER_UPDATED } from '../utils';

// export const ee = new EventEmitter(); // Global EventEmitter pour notifications

const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.VITE_PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.VITE_PUSHER_CLUSTER,
  useTLS: true,
});

export const timersRouter = router({
  getById: procedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const timer = await db.query.timer.findFirst({
        where: (timer, { eq }) => eq(timer.id, input.id),
        with: {
          actions: true,
        },
      });
      return timer;
    }),

  getCurrentTimerByWeddingEventId: procedure
    .input(
      z.object({
        weddingEventId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const currentTimer = await db.query.timer.findFirst({
        where: (timer, { eq }) =>
          eq(timer.weddingEventId, input.weddingEventId),
        orderBy: (timer, { asc }) => [asc(timer.orderIndex)],
        with: {
          actions: true,
        },
      });
      return currentTimer;
    }),

  listByWeddingEventId: procedure
    .input(
      z.object({
        weddingEventId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const items = await db.query.timer.findMany({
        where: (timer, { eq }) =>
          eq(timer.weddingEventId, input.weddingEventId as string),
        orderBy: (timer, { asc }) => [asc(timer.orderIndex)],
        with: {
          actions: {
            orderBy: [asc(timerAction.orderIndex)],
          },
        },
      });
      return items;
    }),
  updateTimer: authedProcedure
    .input(
      z.object({
        ...updateTimerSchema.shape,
        id: z.string(),
        cascadeUpdate: z.boolean().optional(),
        originalDurationMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { cascadeUpdate, originalDurationMinutes, ...updateData } = input;

      const updatedTimer = await ctx.db
        .update(timer)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(timer.id, input.id))
        .returning();

      // Si cascade update est activé et qu'on a une nouvelle duration
      if (
        cascadeUpdate &&
        updateData.durationMinutes &&
        originalDurationMinutes !== undefined
      ) {
        const minutesDiff =
          updateData.durationMinutes - originalDurationMinutes;

        if (minutesDiff !== 0) {
          // Récupérer le timer modifié pour obtenir son weddingEventId et orderIndex
          const currentTimer = await ctx.db.query.timer.findFirst({
            where: (timer, { eq }) => eq(timer.id, input.id),
          });

          if (currentTimer) {
            // Mettre à jour tous les timers suivants
            const followingTimers = await ctx.db.query.timer.findMany({
              where: (timer, { eq, gt }) =>
                and(
                  eq(timer.weddingEventId, currentTimer.weddingEventId),
                  gt(timer.orderIndex, currentTimer.orderIndex)
                ),
            });

            // Décaler l'heure de début de chaque timer suivant
            for (const followingTimer of followingTimers) {
              if (followingTimer.scheduledStartTime) {
                const newStartTime = new Date(
                  followingTimer.scheduledStartTime
                );
                newStartTime.setMinutes(
                  newStartTime.getMinutes() + minutesDiff
                );

                await ctx.db
                  .update(timer)
                  .set({
                    scheduledStartTime: newStartTime,
                    updatedAt: new Date(),
                  })
                  .where(eq(timer.id, followingTimer.id));
              }
            }
          }
        }
      }

      // Notifier les clients via Pusher
      pusher.trigger(CHANNEL, TIMER_UPDATED, {
        id: input.id,
      });

      return updatedTimer;
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
