import { db } from '@/db';
import * as schema from '@/db/schema/auth';
import { env } from '@/env/server';
import { serverOnly } from '@tanstack/react-start';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { reactStartCookies } from 'better-auth/react-start';

const getAuthConfig = serverOnly(() =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
      // debugLogs: true,
    }),
    // https://www.better-auth.com/docs/concepts/session-management#session-caching
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: [
      env.VITE_BASE_URL! || 'http://localhost:5173', // fallback for direct Vite access
    ],
    plugins: [reactStartCookies()],
  })
);

export const auth = getAuthConfig();
