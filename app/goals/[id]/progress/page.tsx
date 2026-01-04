'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressGraph from '@/components/ProgressGraph';
import ProgressLogger from '@/components/ProgressLogger';
import { supabase } from '@/lib/supabase';
import type { ProgressLog, Goal } from '@/types';

export default function GoalProgressPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogger, setShowLogger] = useState(false);
  const [editingLog, setEditingLog] = useState<ProgressLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    
    // Check if URL has ?log=true parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('log') === 'true') {
        setShowLogger(true);
      }
    }
  }, [goalId]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Parallelize data fetching
      const [goalResult, logsResult] = await Promise.all([
        supabase
          .from('goals')
          .select('*')
          .eq('id', goalId)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('progress_logs')
          .select('*')
          .eq('goal_id', goalId)
          .eq('user_id', user.id)
          .order('logged_at', { ascending: false })
      ]);

      if (goalResult.error) throw goalResult.error;
      setGoal(goalResult.data);

      if (logsResult.error) throw logsResult.error;
      setLogs(logsResult.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this progress entry?')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('progress_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete progress');
    }
  };

  const handleEdit = (log: ProgressLog) => {
    setEditingLog(log);
    setShowLogger(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-light text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="text-sm text-black font-light border-l-2 border-black pl-3 py-2 mb-8">
            Goal not found
          </div>
          <Button onClick={() => router.push('/')}>Back to Goals</Button>
        </div>
      </div>
    );
  }

  const latestLog = logs[0];
  const currentProgress = latestLog?.percentage || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm font-light text-gray-600 hover:text-black transition-colors mb-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-light text-black mb-2">{goal.title}</h1>
          <p className="text-sm font-light text-gray-600">
            Current Progress: {currentProgress}%
          </p>
        </div>

        {error && (
          <div className="text-sm text-black font-light border-l-2 border-black pl-3 py-2 mb-4">
            {error}
          </div>
        )}

        {showLogger ? (
          <Card>
            {editingLog ? (
              <EditProgressForm
                log={editingLog}
                onSave={() => {
                  setEditingLog(null);
                  setShowLogger(false);
                  fetchData();
                }}
                onCancel={() => {
                  setEditingLog(null);
                  setShowLogger(false);
                }}
              />
            ) : (
              <ProgressLogger
                goalId={goalId}
                onProgressLogged={fetchData}
                onClose={() => setShowLogger(false)}
              />
            )}
          </Card>
        ) : (
          <>
            <Card>
              <div className="mb-4">
                <ProgressGraph
                  logs={logs}
                  goalStartDate={goal.start_date}
                  goalEndDate={goal.target_end_date}
                />
              </div>
              <Button
                onClick={() => setShowLogger(true)}
                className="w-full"
              >
                Log Progress
              </Button>
            </Card>

            {logs.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-light text-black mb-4">Progress History</h2>
                {logs.map((log) => (
                  <Card key={log.id} className="mb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-light text-black">
                            {log.percentage}%
                          </span>
                          <span className="text-xs font-light text-gray-600">
                            {format(new Date(log.logged_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-sm font-light text-gray-600 mt-2">
                            {log.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(log)}
                          className="text-xs font-light text-gray-600 hover:text-black transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-xs font-light text-gray-600 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EditProgressForm({ 
  log, 
  onSave, 
  onCancel 
}: { 
  log: ProgressLog; 
  onSave: () => void; 
  onCancel: () => void;
}) {
  const [percentage, setPercentage] = useState(log.percentage.toString());
  const [notes, setNotes] = useState(log.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in');
      }

      const percent = parseInt(percentage);
      if (isNaN(percent) || percent < 0 || percent > 100) {
        throw new Error('Percentage must be between 0 and 100');
      }

      const { error: updateError } = await supabase
        .from('progress_logs')
        .update({
          percentage: percent,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', log.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to update progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-light text-black">Edit Progress</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-light text-gray-700 mb-2">
            Progress (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            required
            className="w-full bg-transparent border-0 border-b border-gray-300 pb-2 pt-1 text-sm font-light text-black focus:outline-none focus:border-black transition-colors duration-200"
          />
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-light text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-transparent border-0 border-b border-gray-300 pb-2 pt-1 text-sm font-light text-black focus:outline-none focus:border-black transition-colors duration-200 resize-none"
          />
        </div>

        {error && (
          <div className="text-sm text-black font-light border-l-2 border-black pl-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </form>
    </div>
  );
}

