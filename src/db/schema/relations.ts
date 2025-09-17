import { relations } from 'drizzle-orm';
import { account, session, user } from './auth';
import {
  timer,
  timerAdjustment,
  timerExecution,
  weddingEvent,
  weddingParticipant,
} from './timer';

// Relations Drizzle
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  ownedWeddingEvents: many(weddingEvent),
  createdTimers: many(timer, { relationName: 'createdTimers' }),
  modifiedTimers: many(timer, { relationName: 'modifiedTimers' }),
  startedExecutions: many(timerExecution, {
    relationName: 'startedExecutions',
  }),
  stoppedExecutions: many(timerExecution, {
    relationName: 'stoppedExecutions',
  }),
  timerAdjustments: many(timerAdjustment),
  weddingParticipations: many(weddingParticipant),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const weddingEventRelations = relations(
  weddingEvent,
  ({ one, many }) => ({
    owner: one(user, {
      fields: [weddingEvent.ownerId],
      references: [user.id],
    }),
    timers: many(timer),
    participants: many(weddingParticipant),
  })
);

export const timerRelations = relations(timer, ({ one, many }) => ({
  weddingEvent: one(weddingEvent, {
    fields: [timer.weddingEventId],
    references: [weddingEvent.id],
  }),
  createdBy: one(user, {
    fields: [timer.createdById],
    references: [user.id],
    relationName: 'createdTimers',
  }),
  lastModifiedBy: one(user, {
    fields: [timer.lastModifiedById],
    references: [user.id],
    relationName: 'modifiedTimers',
  }),
  executions: many(timerExecution),
  adjustments: many(timerAdjustment),
}));

export const timerExecutionRelations = relations(timerExecution, ({ one }) => ({
  timer: one(timer, {
    fields: [timerExecution.timerId],
    references: [timer.id],
  }),
  startedBy: one(user, {
    fields: [timerExecution.startedById],
    references: [user.id],
    relationName: 'startedExecutions',
  }),
  stoppedBy: one(user, {
    fields: [timerExecution.stoppedById],
    references: [user.id],
    relationName: 'stoppedExecutions',
  }),
}));

export const timerAdjustmentRelations = relations(
  timerAdjustment,
  ({ one }) => ({
    timer: one(timer, {
      fields: [timerAdjustment.timerId],
      references: [timer.id],
    }),
    createdBy: one(user, {
      fields: [timerAdjustment.createdById],
      references: [user.id],
    }),
  })
);

export const weddingParticipantRelations = relations(
  weddingParticipant,
  ({ one }) => ({
    weddingEvent: one(weddingEvent, {
      fields: [weddingParticipant.weddingEventId],
      references: [weddingEvent.id],
    }),
    user: one(user, {
      fields: [weddingParticipant.userId],
      references: [user.id],
    }),
  })
);
