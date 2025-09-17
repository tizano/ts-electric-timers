import { db } from '@/db'; // your drizzle instance
import * as schema from '@/db/schema/auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { reactStartCookies } from 'better-auth/react-start';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    // debugLogs: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    process.env.CORS_ORIGIN! || 'http://localhost:5173', // fallback for direct Vite access
  ],
  plugins: [reactStartCookies()],
});
