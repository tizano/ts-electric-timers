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

export const ADJUSTMENT_TYPES = ['ADD_TIME', 'REMOVE_TIME'] as const;

export const EXECUTION_STATUSES = ['STARTED', 'COMPLETED'] as const;

export const TIMER_STATUSES = [
  'PENDING',
  'RUNNING',
  'TRIGGER_ASSETS',
  'PLAYING_END_ASSETS',
  'COMPLETED',
] as const;

export const ASSET_TYPES = ['GALLERY', 'IMAGE', 'SOUND', 'VIDEO'] as const;

// Enums
export const adjustmentTypeEnum = pgEnum('adjustment_type', ADJUSTMENT_TYPES);
export const assetTypeEnum = pgEnum('asset_type', ASSET_TYPES);
export const executionStatusEnum = pgEnum(
  'execution_status',
  EXECUTION_STATUSES
);
export const timerStatusEnum = pgEnum('timer_status', TIMER_STATUSES);

export const timer = pgTable('timer', {
  id: text('id').primaryKey(),
  weddingEventId: text('wedding_event_id')
    .notNull()
    .references(() => weddingEvent.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  scheduledStartTime: timestamp('scheduled_start_time'),
  durationMinutes: integer('duration_minutes'),
  // Décalage du trigger (ex: -5 = 5 minutes avant la fin, +2 = 2 minutes après le début)
  triggerOffsetMinutes: integer('trigger_offset_minutes'),

  status: timerStatusEnum('status').notNull().default('PENDING'),
  isManual: boolean('is_manual').notNull().default(false),
  isPunctual: boolean('is_punctual').notNull().default(false),

  orderIndex: integer('order_index').notNull().default(0),

  createdById: text('created_by_id')
    .notNull()
    .references(() => user.id),
  lastModifiedById: text('last_modified_by_id').references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const timerExecution = pgTable('timer_execution', {
  id: text('id').primaryKey(),
  timerId: text('timer_id')
    .notNull()
    .references(() => timer.id, { onDelete: 'cascade' }),
  actualStartTime: timestamp('actual_start_time').notNull(),
  actualEndTime: timestamp('actual_end_time'),
  actualDurationMinutes: integer('actual_duration_minutes'),
  status: executionStatusEnum('status').notNull(),
  startedById: text('started_by_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const timerAdjustment = pgTable('timer_adjustment', {
  id: text('id').primaryKey(),
  timerId: text('timer_id')
    .notNull()
    .references(() => timer.id, { onDelete: 'cascade' }),
  adjustmentType: adjustmentTypeEnum('adjustment_type').notNull(),
  minutesAdded: integer('minutes_added').notNull(), // Peut être négatif
  cascadeToFollowing: boolean('cascade_to_following').notNull().default(false),
  reason: text('reason'),
  createdById: text('created_by_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const timerAsset = pgTable('timer_asset', {
  id: text('id').primaryKey(),
  timerId: text('timer_id')
    .notNull()
    .references(() => timer.id, { onDelete: 'cascade' }),

  type: assetTypeEnum('type').notNull(), // SOUND, VIDEO, IMAGE, TEXT, GALLERY
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

export const selectTimerAdjustmentSchema = createSelectSchema(timerAdjustment);
export const createTimerAdjustmentSchema = createInsertSchema(timerAdjustment);
export const updateTimerAdjustmentSchema = createUpdateSchema(timerAdjustment);

export type TimerAdjustment = z.infer<typeof selectTimerAdjustmentSchema>;
export type NewTimerAdjustment = z.infer<typeof createTimerAdjustmentSchema>;
export type UpdateTimerAdjustment = z.infer<typeof updateTimerAdjustmentSchema>;

export const selectTimerExecutionSchema = createSelectSchema(timerExecution);
export const createTimerExecutionSchema = createInsertSchema(timerExecution);
export const updateTimerExecutionSchema = createUpdateSchema(timerExecution);

export type TimerExecution = z.infer<typeof selectTimerExecutionSchema>;
export type NewTimerExecution = z.infer<typeof createTimerExecutionSchema>;
export type UpdateTimerExecution = z.infer<typeof updateTimerExecutionSchema>;

export const selectTimerAssetSchema = createSelectSchema(timerAsset);
export const createTimerAssetSchema = createInsertSchema(timerAsset);
export const updateTimerAssetSchema = createUpdateSchema(timerAsset);

export type TimerAsset = z.infer<typeof selectTimerAssetSchema>;
export type NewTimerAsset = z.infer<typeof createTimerAssetSchema>;
export type UpdateTimerAsset = z.infer<typeof updateTimerAssetSchema>;
