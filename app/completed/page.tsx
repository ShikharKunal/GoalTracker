'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import type { Goal } from '@/types';

export default function CompletedGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedGoals();
  }, []);

  const fetchCompletedGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('You must be logged in to view goals');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', false)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setGoals(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch completed goals');
    } finally {
      setLoading(false);
    }
  };

  const formatTargetDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM yyyy');
  };

  const formatCompletedDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleReactivate = async (goalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('goals')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchCompletedGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to reactivate goal');
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to permanently delete this goal?')) {
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

      fetchCompletedGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-sm font-light text-gray-600 dark:text-gray-400">Loading...</p>
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

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-light text-black dark:text-white mb-2">Completed Goals</h1>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                {goals.length === 0 
                  ? 'No completed goals yet' 
                  : `${goals.length} completed goal${goals.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <Link href="/">
              <button className="text-sm font-light text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                Active
              </button>
            </Link>
          </div>
        </div>

        {error && !error.includes('logged in') && (
          <div className="text-sm text-black dark:text-white font-light border-l-2 border-black dark:border-white pl-3 py-2 mb-8">
            {error}
          </div>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-light text-gray-600 dark:text-gray-400 mb-8">
              You haven&apos;t completed any goals yet
            </p>
            <Link href="/">
              <Button>View Active Goals</Button>
            </Link>
          </div>
        ) : (
          <div>
            {goals.map((goal) => (
              <Card key={goal.id}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-light text-black dark:text-white flex-1">
                      {goal.title}
                    </h2>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleReactivate(goal.id)}
                        className="text-xs font-light text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        title="Reactivate goal"
                      >
                        Reactivate
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-xs font-light text-gray-600 hover:text-red-600 transition-colors"
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
                  
                  <div className="text-sm font-light text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Target was: {formatTargetDate(goal.target_end_date)}</div>
                    {goal.updated_at && (
                      <div className="text-xs">
                        Completed: {formatCompletedDate(goal.updated_at)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t-2 border-black dark:border-white">
          <Link href="/">
            <Button className="w-full">Back to Active Goals</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

