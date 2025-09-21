import authClient from '@/lib/auth/auth-client';
import { authQueryOptions } from '@/lib/auth/queries';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import type { User } from 'better-auth';

export const Header = ({ user }: { user: User }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onResponse: async () => {
          // manually set to null to avoid unnecessary refetching
          queryClient.setQueryData(authQueryOptions().queryKey, null);
          await router.invalidate();
        },
      },
    });
  };

  return (
    <>
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center space-x-4">
              <h1
                className="text-lg font-semibold text-gray-900 hover:text-indigo-900 hover:cursor-pointer transition-colors"
                onClick={() => navigate({ to: '/dashboard' })}
              >
                Tony & Neka Timers
              </h1>
              <Link
                to="/"
                className="text-gray-900 hover:text-indigo-900  hover:cursor-pointer hover:underline"
              >
                Home Wedding
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-700">{user.email}</span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors hover:cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
