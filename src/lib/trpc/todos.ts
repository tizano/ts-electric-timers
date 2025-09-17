import { createTodoSchema, todo, updateTodoSchema } from '@/db/schema/todo';
import { authedProcedure, generateTxId, router } from '@/lib/trpc';
import { TRPCError } from '@trpc/server';
import { and, arrayContains, eq } from 'drizzle-orm';
import { z } from 'zod';

export const todosRouter = router({
  create: authedProcedure
    .input(createTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        const txid = await generateTxId(tx);
        const [newItem] = await tx.insert(todo).values(input).returning();
        return { item: newItem, txid };
      });

      return result;
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.number(),
        data: updateTodoSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        const txid = await generateTxId(tx);
        const [updatedItem] = await tx
          .update(todo)
          .set(input.data)
          .where(
            and(
              eq(todo.id, input.id),
              arrayContains(todo.user_ids, [ctx.session.user.id])
            )
          )
          .returning();

        if (!updatedItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message:
              'Todo not found or you do not have permission to update it',
          });
        }

        return { item: updatedItem, txid };
      });

      return result;
    }),

  delete: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        const txid = await generateTxId(tx);
        const [deletedItem] = await tx
          .delete(todo)
          .where(
            and(
              eq(todo.id, input.id),
              arrayContains(todo.user_ids, [ctx.session.user.id])
            )
          )
          .returning();

        if (!deletedItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message:
              'Todo not found or you do not have permission to delete it',
          });
        }

        return { item: deletedItem, txid };
      });

      return result;
    }),
});
