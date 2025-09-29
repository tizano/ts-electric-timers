import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createSchemaFactory } from 'drizzle-zod';
import z from 'zod';
import { user } from './auth';
import { weddingEvent } from './wedding-event';

export const TIMER_STATUSES = ['PENDING', 'RUNNING', 'COMPLETED'] as const;
export const ASSET_TYPES = ['GALLERY', 'IMAGE', 'SOUND', 'VIDEO'] as const;
export const TRIGGER_TYPES = ['AFTER_START', 'BEFORE_END', 'AT_END'] as const;

// Enums
export const timerStatusEnum = pgEnum('timer_status', TIMER_STATUSES);
export const assetTypeEnum = pgEnum('asset_type', ASSET_TYPES);
export const triggerTypeEnum = pgEnum('trigger_type', TRIGGER_TYPES);

export const timer = pgTable('timer', {
  id: text('id').primaryKey(),
  weddingEventId: text('wedding_event_id')
    .notNull()
    .references(() => weddingEvent.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  scheduledStartTime: timestamp('scheduled_start_time'), // Obligatoire pour punctual
  actualStartTime: timestamp('actual_start_time'), // Démarrage réel
  durationMinutes: integer('duration_minutes').default(0), // 0 ou null = punctual (pas de countdown)

  status: timerStatusEnum('status').default('PENDING').notNull(),
  isManual: boolean('is_manual').default(false).notNull(), // Gardé, pour trigger manuel indépendamment

  orderIndex: integer('order_index').notNull().default(0),

  createdById: text('created_by_id')
    .notNull()
    .references(() => user.id),
  lastModifiedById: text('last_modified_by_id').references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const timerAction = pgTable('timer_action', {
  id: text('id').primaryKey(),
  timerId: text('timer_id')
    .notNull()
    .references(() => timer.id, { onDelete: 'cascade' }),

  type: assetTypeEnum('type').notNull(), // SOUND, VIDEO, IMAGE, TEXT, GALLERY
  triggerType: triggerTypeEnum('trigger_type').default('AT_END').notNull(), // Ajout: BEFORE_END (use offset), AT_END, etc.
  triggerOffsetMinutes: integer('trigger_offset_minutes'), // Seulement si duration > 0

  executedAt: timestamp('executed_at'),

  title: text('title'),
  url: text('url'), // pour sons/vidéos/images
  // Multilingue pour les textes
  contentFr: text('content_fr'),
  contentEn: text('content_en'),
  contentBr: text('content_br'),

  orderIndex: integer('order_index').notNull().default(0),
  displayDurationSec: integer('display_duration_sec'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});

const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

export const selectTimerSchema = createSelectSchema(timer);
export const createTimerSchema = createInsertSchema(timer);
export const updateTimerSchema = createUpdateSchema(timer);

export type Timer = z.infer<typeof selectTimerSchema>;
export type NewTimer = z.infer<typeof createTimerSchema>;
export type UpdateTimer = z.infer<typeof updateTimerSchema>;

export const selectTimerActionSchema = createSelectSchema(timerAction);
export const createTimerActionSchema = createInsertSchema(timerAction);
export const updateTimerActionSchema = createUpdateSchema(timerAction);

export type TimerAction = z.infer<typeof selectTimerActionSchema>;
export type NewTimerAction = z.infer<typeof createTimerActionSchema>;
export type UpdateTimerAction = z.infer<typeof updateTimerActionSchema>;
