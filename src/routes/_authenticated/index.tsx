import { authClient } from '@/lib/auth-client';
import { todoCollection } from '@/lib/collections';
import { useLiveQuery } from '@tanstack/react-db';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute(`/_authenticated/`)({
  component: IndexRedirect,
  ssr: false,
  beforeLoad: async () => {
    const res = await authClient.getSession();
    if (!res.data?.session) {
      throw redirect({
        to: `/login`,
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
  },
  loader: async () => {
    await Promise.all([todoCollection.preload()]);

    return null;
  },
});

function IndexRedirect() {
  const navigate = useNavigate();
  const { data: todos, isLoading } = useLiveQuery((q) =>
    q.from({ todoCollection })
  );

  useEffect(() => {
    if (todos.length > 0) {
      const firstTodo = todos[0];
    }
  }, [todos, navigate]);

  return (
    <div className="p-6">
      <div className="text-center">
        {!isLoading &&
          todos.length > 0 &&
          todos.map((todo) => (
            <div key={todo.id} className="mb-4 p-4 border rounded shadow">
              <h2 className="text-xl font-bold mb-2">{todo.text}</h2>
              <p className="text-gray-700">
                {todo.completed ? 'Completed' : 'Not Completed'}
              </p>
            </div>
          ))}
        {isLoading && <p className="text-gray-500">Loading todos...</p>}
      </div>
    </div>
  );
}
