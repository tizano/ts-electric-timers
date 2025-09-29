import { clsx, type ClassValue } from 'clsx';
import SuperJSON from 'superjson';
import { twMerge } from 'tailwind-merge';

export const CHANNEL = 'WEDDING_TIMERS';
export const TIMER_UPDATED = 'TIMER_UPDATED';
export const ACTION_EXECUTED_EVENT = 'ACTION_EXECUTED';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const transformer = SuperJSON;
