import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Timer } from '@/db/schema/timer';
import { trpc } from '@/lib/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const updateTimerSchema = z.object({
  name: z.string().min(1, 'Timer name is required'),
  scheduledStartTime: z.string().optional(),
  durationMinutes: z.number().min(0, 'Duration must be positive'),
  cascadeUpdate: z.boolean(),
});

type UpdateTimerForm = z.infer<typeof updateTimerSchema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    setError,
  } = useForm<UpdateTimerForm>({
    resolver: zodResolver(updateTimerSchema),
    defaultValues: {
      name: '',
      scheduledStartTime: '',
      durationMinutes: 0,
      cascadeUpdate: false,
    },
  });

  // Populate form when timer data is loaded
  useEffect(() => {
    if (timer) {
      console.log(timer.scheduledStartTime?.toISOString());

      reset({
        name: timer.name,
        scheduledStartTime:
          timer.scheduledStartTime?.toISOString().slice(0, 16) || undefined,
        durationMinutes: timer.durationMinutes || 0,
        cascadeUpdate: false,
      });
    }
  }, [timer, reset]);

  const onSubmit = async (data: UpdateTimerForm) => {
    try {
      const scheduledStartTime = data.scheduledStartTime
        ? new Date(data.scheduledStartTime)
        : null;

      await trpc.timers.updateTimer.mutate({
        id: timerId,
        name: data.name,
        scheduledStartTime: scheduledStartTime,
        durationMinutes: data.durationMinutes,
        lastModifiedById: user.id,
        updatedAt: new Date(),
        cascadeUpdate: data.cascadeUpdate,
        originalDurationMinutes: timer.durationMinutes || 0,
      });

      // Navigate back to dashboard on success
      if (canGoBack) {
        router.history.back();
      } else {
        navigate({ to: '/dashboard' });
      }
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while updating the timer',
      });
    }
  };

  if (!timer) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Timer not found</div>
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.root.message}
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
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
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
                {...register('scheduledStartTime')}
                className={errors.scheduledStartTime ? 'border-red-500' : ''}
              />
              {errors.scheduledStartTime && (
                <p className="text-sm text-red-600">
                  {errors.scheduledStartTime.message}
                </p>
              )}
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
                {...register('durationMinutes', {
                  valueAsNumber: true,
                })}
                className={errors.durationMinutes ? 'border-red-500' : ''}
              />
              {errors.durationMinutes && (
                <p className="text-sm text-red-600">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>

            {/* Cascade Update Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                id="cascadeUpdate"
                type="checkbox"
                {...register('cascadeUpdate')}
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
