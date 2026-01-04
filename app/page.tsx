'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, differenceInDays, isAfter } from 'date-fns';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AuthButton from '@/components/AuthButton';
import NotificationSettings from '@/components/NotificationSettings';
import PieChart from '@/components/PieChart';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';
import type { Goal, ProgressLog } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressLogs, setProgressLogs] = useState<Record<string, ProgressLog>>({});
  const reminderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchGoals();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchGoals();
      }
    });

    // Check for reminders client-side (faster, no API call needed)
    const checkReminders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get all active goals
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (!goals) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueReminders = goals.filter((goal) => {
          const reminderDate = new Date(goal.next_reminder_date);
          reminderDate.setHours(0, 0, 0, 0);
          return reminderDate.getTime() === today.getTime();
        });

        if (dueReminders.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          dueReminders.forEach((goal) => {
            // Duolingo-style engaging notifications
            const motivationalMessages = [
              `Keep going! "${goal.title}" is waiting for you 🎯`,
              `You've got this! Time to check in on "${goal.title}" 💪`,
              `Don't break the streak! Update your progress on "${goal.title}" 🔥`,
              `Your future self will thank you! Check in on "${goal.title}" ✨`,
              `Small steps, big progress! How's "${goal.title}" going? 🌱`,
            ];
            
            const randomMessage = motivationalMessages[
              Math.floor(Math.random() * motivationalMessages.length)
            ];

            const notification = new Notification(randomMessage, {
              body: `Target: ${format(new Date(goal.target_end_date), 'MMM yyyy')} • Tap to log your progress`,
              icon: '/icon-192.png',
              tag: `goal-${goal.id}`,
              requireInteraction: false,
              badge: '/icon-192.png',
            });

            // Make notification clickable - open progress page
            notification.onclick = () => {
              window.focus();
              window.location.href = `/goals/${goal.id}/progress?log=true`;
              notification.close();
            };
          });
        }
      } catch (error) {
        // Silently handle errors
      }
    };

    // Check if user is logged in and set up reminder checking
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Check reminders after page loads (non-blocking)
        reminderTimeoutRef.current = setTimeout(checkReminders, 3000);
        // Check reminders every hour
        reminderIntervalRef.current = setInterval(checkReminders, 60 * 60 * 1000);
      }
    });
    
    return () => {
      subscription.unsubscribe();
      if (reminderTimeoutRef.current) clearTimeout(reminderTimeoutRef.current);
      if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current);
    };
  }, []);

  const fetchGoals = async () => {
    try {
      // Add timeout for mobile networks
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - please check your connection')), 15000)
      );

      const fetchPromise = (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('You must be logged in to view goals');
          setLoading(false);
          return;
        }

        // Parallelize all data fetching for better performance
        const [goalsResult, countResult, logsResult] = await Promise.all([
          // Fetch active goals
          supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('target_end_date', { ascending: true }),
          
          // Fetch completed goals count
          supabase
            .from('goals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_active', false),
          
          // Pre-fetch progress logs (we'll filter after)
          supabase
            .from('progress_logs')
            .select('goal_id, percentage, logged_at')
            .eq('user_id', user.id)
            .order('logged_at', { ascending: false })
            .limit(50) // Only get recent logs
        ]);

        if (goalsResult.error) {
          throw goalsResult.error;
        }

        const goals = goalsResult.data || [];
        setGoals(goals);

        if (!countResult.error && countResult.count !== null) {
          setCompletedCount(countResult.count);
        }

        // Process progress logs efficiently
        if (goals.length > 0 && logsResult.data) {
          const goalIds = new Set(goals.map(g => g.id));
          const latestLogs: Record<string, ProgressLog> = {};
          
          // Only process logs for goals we have
          for (const log of logsResult.data) {
            if (goalIds.has(log.goal_id) && !latestLogs[log.goal_id]) {
              latestLogs[log.goal_id] = log as ProgressLog;
            }
            // Early exit optimization
            if (Object.keys(latestLogs).length === goalIds.size) break;
          }
          setProgressLogs(latestLogs);
        }
      })();

      await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError(err.message || 'Failed to fetch goals. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to delete goal');
    }
  };

  const handleComplete = async (goalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('goals')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to complete goal');
    }
  };

  const formatTargetDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM yyyy');
  };

  const getReminderText = (reminderDateString: string) => {
    const reminderDate = new Date(reminderDateString);
    const today = new Date();
    const daysUntil = differenceInDays(reminderDate, today);

    if (daysUntil < 0) {
      return 'Overdue';
    } else if (daysUntil === 0) {
      return 'Today';
    } else if (daysUntil === 1) {
      return 'Tomorrow';
    } else {
      return `in ${daysUntil} days`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center">
        <p className="text-sm font-light text-gray-600 dark:text-gray-400 mb-4">Loading...</p>
        <p className="text-xs font-light text-gray-400 dark:text-gray-600">If this takes too long, check your connection</p>
        <button
          onClick={() => {
            setLoading(false);
            setError('Loading cancelled. Please refresh the page.');
          }}
          className="mt-4 text-xs font-light text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (error && error.includes('logged in')) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="text-sm text-black dark:text-white font-light border-l-2 border-black dark:border-white pl-3 py-2 mb-8">
            {error}
          </div>
          <Link href="/login">
            <Button className="w-full">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="text-sm text-black dark:text-white font-light border-l-2 border-black dark:border-white pl-3 py-2 mb-8">
            {error}
          </div>
          <Button onClick={fetchGoals}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-light text-black dark:text-white mb-2">Goals</h1>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                {goals.length === 0 
                  ? 'No active goals yet' 
                  : `${goals.length} active goal${goals.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex justify-end flex-1">
              <NotificationSettings />
            </div>
            {(goals.length > 0 || completedCount > 0) && (
              <div className="ml-4">
                <PieChart active={goals.length} completed={completedCount} size={100} />
              </div>
            )}
          </div>
          {completedCount > 0 && (
            <div className="mb-4">
              <Link href="/completed">
                <button className="text-sm font-light text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  View {completedCount} completed goal{completedCount !== 1 ? 's' : ''} →
                </button>
              </Link>
            </div>
          )}
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-light text-gray-600 dark:text-gray-400 mb-8">
              Start tracking your long-term goals
            </p>
            <Link href="/add">
              <Button>Create Your First Goal</Button>
            </Link>
          </div>
        ) : (
          <div>
            {goals.map((goal) => {
              const latestProgress = progressLogs[goal.id];
              const currentProgress = latestProgress?.percentage || 0;
              
              return (
                <Card key={goal.id}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-light text-black dark:text-white flex-1">
                        {goal.title}
                      </h2>
                      <div className="flex gap-2 ml-4">
                      <Link href={`/edit/${goal.id}`} prefetch={true}>
                        <button
                          className="text-xs font-light text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                          title="Edit goal"
                        >
                          Edit
                        </button>
                      </Link>
                        <button
                          onClick={() => handleComplete(goal.id)}
                          className="text-xs font-light text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                          title="Mark as complete"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="text-xs font-light text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete goal"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress indicator */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-light text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-sm font-light text-black dark:text-white">{currentProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 border-2 border-black dark:border-white">
                        <div 
                          className="bg-black dark:bg-white h-full transition-all duration-300 border-r-2 border-black dark:border-white"
                          style={{ width: `${currentProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm font-light text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Target: {formatTargetDate(goal.target_end_date)}</div>
                      <div className="text-xs">
                        Next check-in: {getReminderText(goal.next_reminder_date)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t-2 border-black dark:border-white">
                      <Link href={`/goals/${goal.id}/progress`} prefetch={true}>
                        <Button className="flex-1 text-xs py-1 w-full">
                          View Progress
                        </Button>
                      </Link>
                      <Link href={`/goals/${goal.id}/progress?log=true`} prefetch={true}>
                        <Button className="flex-1 text-xs py-1 w-full">
                          Log Progress
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 pt-8 border-t-2 border-black dark:border-white">
          <Link href="/add">
            <Button className="w-full">Add New Goal</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


