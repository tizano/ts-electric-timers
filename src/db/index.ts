import { neon, neonConfig } from '@neondatabase/serverless';
import { serverOnly } from '@tanstack/react-start';
import { drizzle } from 'drizzle-orm/neon-http';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true

const sql = neon(process.env.DATABASE_URL!);

const getDatabase = serverOnly(() => drizzle(sql));

export const db = getDatabase();
