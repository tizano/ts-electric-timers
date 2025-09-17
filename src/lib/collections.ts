import { selectUserSchema } from '@/db/schema/auth';
import { selectTodoSchema } from '@/db/schema/todo';
import { trpc } from '@/lib/trpc-client';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';

export const usersCollection = createCollection(
  electricCollectionOptions({
    id: 'users',
    shapeOptions: {
      url: new URL(
        `/api/users`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:5173`
      ).toString(),
      parser: {
        timestamptz: (date: string) => {
          return new Date(date);
        },
      },
    },
    schema: selectUserSchema,
    getKey: (item) => item.id,
  })
);

export const todoCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    shapeOptions: {
      url: new URL(
        `/api/todos`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:5173`
      ).toString(),
      params: {
        table: 'todo',
      },
      parser: {
        // Parse timestamp columns into JavaScript Date objects
        timestamptz: (date: string) => {
          return new Date(date);
        },
      },
    },
    schema: selectTodoSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newTodo } = transaction.mutations[0];
      const result = await trpc.todos.create.mutate({
        user_id: newTodo.user_id,
        text: newTodo.text,
        completed: newTodo.completed,
        user_ids: newTodo.user_ids,
      });

      return { txid: result.txid };
    },
    onUpdate: async ({ transaction }) => {
      const { modified: updatedTodo } = transaction.mutations[0];
      const result = await trpc.todos.update.mutate({
        id: updatedTodo.id,
        data: {
          text: updatedTodo.text,
          completed: updatedTodo.completed,
        },
      });

      return { txid: result.txid };
    },
    onDelete: async ({ transaction }) => {
      const { original: deletedTodo } = transaction.mutations[0];
      const result = await trpc.todos.delete.mutate({
        id: deletedTodo.id,
      });

      return { txid: result.txid };
    },
  })
);
