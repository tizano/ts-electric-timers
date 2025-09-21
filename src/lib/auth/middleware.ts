import { createMiddleware } from '@tanstack/react-start';
import { getWebRequest, setResponseStatus } from '@tanstack/react-start/server';
import { auth } from './auth';

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await auth.api.getSession({
      headers: getWebRequest().headers,
      query: {
        // ensure session is fresh
        // https://www.better-auth.com/docs/concepts/session-management#session-caching
        disableCookieCache: true,
      },
    });
    if (!session) {
      setResponseStatus(401);
      throw new Error('Unauthorized');
    }
    return next({ context: { user: session.user } });
  }
);
