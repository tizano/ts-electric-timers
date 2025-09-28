import { clsx, type ClassValue } from 'clsx';
import SuperJSON from 'superjson';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const transformer = SuperJSON;
