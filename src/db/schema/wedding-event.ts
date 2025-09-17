import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const PARTICIPANT_ROLES = [
  'OWNER',
  'COORDINATOR',
  'PARTICIPANT',
  'VIEW_ONLY',
] as const;

export const participantRoleEnum = pgEnum(
  'participant_role',
  PARTICIPANT_ROLES,
);

// Nouvelles tables pour la gestion de timing
export const weddingEvent = pgTable('wedding_event', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  location: text('location'),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const weddingParticipant = pgTable('wedding_participant', {
  id: text('id').primaryKey(),
  weddingEventId: text('wedding_event_id')
    .notNull()
    .references(() => weddingEvent.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: participantRoleEnum('role').notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});
