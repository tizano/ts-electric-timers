import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Timer, UpdateTimer } from '@/db/schema/timer';
import { trpc } from '@/lib/trpc-client';
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute(
  '/(authenticated)/dashboard/timers/$timerId/'
)({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    return trpc.timers.getById.query({
      id: params.timerId,
    });
  },
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const { timerId } = Route.useParams();
  const timer: Timer = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();

  // State for form data
  const [formData, setFormData] = useState<
    UpdateTimer & { cascadeUpdate: boolean }
  >({
    orderIndex: 0,
    name: '',
    scheduledStartTime: null,
    durationMinutes: 0,
    lastModifiedById: '',
    cascadeUpdate: false,
  });

  const [originalDurationMinutes, setOriginalDurationMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timerError, setTimerError] = useState<string | null>(null);

  // Populate form when timer data is loaded
  useEffect(() => {
    setFormData({
      name: timer.name,
      scheduledStartTime: timer.scheduledStartTime,
      durationMinutes: timer.durationMinutes || 0,
      lastModifiedById: user.id,
      cascadeUpdate: false,
    });
  }, []);

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const scheduledStartTime = formData.scheduledStartTime
        ? new Date(formData.scheduledStartTime)
        : null;

      await trpc.timers.updateTimer.mutate({
        id: timerId,
        name: formData.name,
        scheduledStartTime: scheduledStartTime,
        durationMinutes: formData.durationMinutes,
        lastModifiedById: formData.lastModifiedById,
        updatedAt: new Date(),
        cascadeUpdate: formData.cascadeUpdate,
        originalDurationMinutes,
      });

      // Navigate back to dashboard on success
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (timerError || !timer) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">
          Error loading timer: {timerError || 'Timer not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <StatusBadge status={timer.status} />
          <CardTitle>Edit Timer: {timer.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Timer Name
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Scheduled Start Time */}
            <div className="space-y-2">
              <label
                htmlFor="scheduledStartTime"
                className="block text-sm font-medium text-gray-700"
              >
                Scheduled Start Time
              </label>
              <Input
                id="scheduledStartTime"
                type="datetime-local"
                value={formData.scheduledStartTime?.toString() || ''}
                onChange={(e) =>
                  handleInputChange('scheduledStartTime', e.target.value)
                }
              />
            </div>

            {/* Duration Minutes */}
            <div className="space-y-2">
              <label
                htmlFor="durationMinutes"
                className="block text-sm font-medium text-gray-700"
              >
                Duration (minutes)
              </label>
              <Input
                id="durationMinutes"
                type="number"
                min="0"
                value={formData.durationMinutes || 0}
                onChange={(e) =>
                  handleInputChange(
                    'durationMinutes',
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            {/* Last Modified By */}
            <div className="space-y-2">
              <label
                htmlFor="lastModifiedById"
                className="block text-sm font-medium text-gray-700"
              >
                Last Modified By
              </label>
            </div>

            {/* Cascade Update Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                id="cascadeUpdate"
                type="checkbox"
                checked={formData.cascadeUpdate}
                onChange={(e) =>
                  handleInputChange('cascadeUpdate', e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="cascadeUpdate"
                className="text-sm font-medium text-gray-700"
              >
                Update following timers in cascade
                <span className="block text-xs text-gray-500 mt-1">
                  If duration changes, shift all subsequent timers by the
                  difference
                </span>
              </label>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (canGoBack) {
                    router.history.back();
                  } else {
                    navigate({ to: '/dashboard' });
                  }
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
