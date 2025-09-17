import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createSchemaFactory } from 'drizzle-zod';
import { z } from 'zod';
import { user } from './auth';

export const todo = pgTable('todo', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  text: text('text').notNull(),
  completed: boolean('completed').default(false).notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  user_id: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  user_ids: text('user_ids').array().notNull().default([]),
});

const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

export const selectTodoSchema = createSelectSchema(todo);
export const createTodoSchema = createInsertSchema(todo);
export const updateTodoSchema = createUpdateSchema(todo);

export type Todo = z.infer<typeof selectTodoSchema>;
export type NewTodo = z.infer<typeof createTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
