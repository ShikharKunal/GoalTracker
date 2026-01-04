'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { calculateNextReminderDate } from '@/lib/reminderLogic';

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const fetchGoal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setTitle(data.title);
        setDescription(data.description || '');
        setTargetEndDate(format(new Date(data.target_end_date), 'yyyy-MM-dd'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      if (!title.trim()) {
        throw new Error('Title is required');
      }

      if (!targetEndDate) {
        throw new Error('Target end date is required');
      }

      const startDate = new Date();
      const endDate = new Date(targetEndDate);

      if (endDate <= startDate) {
        throw new Error('Target end date must be in the future');
      }

      // Recalculate next reminder date
      const nextReminderDate = calculateNextReminderDate(startDate, endDate);

      const { error: updateError } = await supabase
        .from('goals')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          target_end_date: endDate.toISOString(),
          next_reminder_date: nextReminderDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to update goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-light text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-light text-black mb-2">Edit Goal</h1>
          <p className="text-sm font-light text-gray-600">
            Update your goal details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            label="Goal Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your goal"
            required
          />

          <div className="w-full">
            <label className="block text-sm font-light text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={4}
              className="w-full bg-transparent border-0 border-b border-gray-300 pb-2 pt-1 text-sm font-light text-black focus:outline-none focus:border-black transition-colors duration-200 resize-none"
            />
          </div>

          <Input
            label="Target End Date"
            type="date"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
            min={today}
            required
          />

          {error && (
            <div className="text-sm text-black font-light border-l-2 border-black pl-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Updating...' : 'Update Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

