import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { weddingEvent } from './wedding-event';

export const ADJUSTMENT_TYPES = [
  'ADD_TIME',
  'REMOVE_TIME',
  'RESCHEDULE',
] as const;

export const EXECUTION_STATUSES = [
  'STARTED',
  'COMPLETED',
  'STOPPED',
  'INTERRUPTED',
] as const;

export const TIMER_STATUSES = [
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'PAUSED',
  'CANCELLED',
] as const;

// Enums
export const timerStatusEnum = pgEnum('timer_status', TIMER_STATUSES);

export const executionStatusEnum = pgEnum(
  'execution_status',
  EXECUTION_STATUSES
);

export const adjustmentTypeEnum = pgEnum('adjustment_type', ADJUSTMENT_TYPES);

export const timer = pgTable('timer', {
  id: text('id').primaryKey(),
  weddingEventId: text('wedding_event_id')
    .notNull()
    .references(() => weddingEvent.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  scheduledStartTime: timestamp('scheduled_start_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  status: timerStatusEnum('status').notNull().default('PENDING'),
  soundFileUrl: text('sound_file_url'),
  imageFileUrl: text('image_file_url'),
  orderIndex: integer('order_index').notNull(),
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
  stoppedById: text('stopped_by_id').references(() => user.id),
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
