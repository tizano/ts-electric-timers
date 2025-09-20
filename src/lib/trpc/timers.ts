import { createTimerSchema, timer } from '@/db/schema/timer';
import { authedProcedure, generateTxId, router } from '@/lib/trpc';

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

  // Add update and delete following the same pattern...
});
