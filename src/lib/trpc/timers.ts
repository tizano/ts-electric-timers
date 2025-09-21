import { createTimerSchema, timer, timerAsset } from '@/db/schema/timer';
import { authedProcedure, generateTxId, procedure, router } from '@/lib/trpc';
import { eq } from 'drizzle-orm';

export const timersRouter = router({
  create: authedProcedure
    .input(createTimerSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        const txid = await generateTxId(tx);
        const [newItem] = await tx
          .insert(timer)
          .values({ ...input, createdById: ctx.session.user.id })
          .returning();
        return { item: newItem, txid };
      });
      return result;
    }),
  list: procedure.query(async ({ ctx }) => {
    const items = await ctx.db
      .select()
      .from(timer)
      .innerJoin(timerAsset, eq(timer.id, timerAsset.timerId))
      .where(eq(timer.weddingEventId, 'wedding-event-1'))
      .orderBy(timer.orderIndex);
    return items;
  }),

  // Add update and delete following the same pattern...
});
