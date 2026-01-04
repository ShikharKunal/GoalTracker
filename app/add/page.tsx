'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { calculateNextReminderDate } from '@/lib/reminderLogic';

export default function AddGoalPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [reminderIntervalDays, setReminderIntervalDays] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Get current user (assuming auth is set up)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Validate inputs
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

      // Parse reminder interval (null = use default)
      const reminderInterval = reminderIntervalDays.trim() 
        ? parseInt(reminderIntervalDays.trim()) 
        : null;
      
      if (reminderInterval !== null && (isNaN(reminderInterval) || reminderInterval < 1)) {
        throw new Error('Reminder interval must be at least 1 day');
      }

      // Calculate next reminder date
      const nextReminderDate = calculateNextReminderDate(startDate, endDate, reminderInterval);

      // Insert goal into Supabase
      const { error: insertError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          start_date: startDate.toISOString(),
          target_end_date: endDate.toISOString(),
          next_reminder_date: nextReminderDate.toISOString(),
          reminder_interval_days: reminderInterval,
          is_active: true,
        } as any);

      if (insertError) {
        throw insertError;
      }

      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-light text-black dark:text-white mb-2">New Goal</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-400">
            Define a long-term goal with a target completion date
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
            <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={4}
              className="w-full bg-transparent border-0 border-b-2 border-black dark:border-white pb-2 pt-1 text-sm font-light text-black dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200 resize-none"
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

          <div className="w-full">
            <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-1">
              Reminder Frequency (days) - Optional
            </label>
            <input
              type="number"
              min="1"
              value={reminderIntervalDays}
              onChange={(e) => setReminderIntervalDays(e.target.value)}
              placeholder="Leave empty for automatic (based on goal duration)"
              className="w-full bg-transparent border-0 border-b-2 border-black dark:border-white pb-2 pt-1 text-sm font-light text-black dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
            />
            <p className="text-xs font-light text-gray-500 dark:text-gray-500 mt-1">
              Default: 3 days (short-term), 7 days (medium), 14 days (long-term)
            </p>
          </div>

          {error && (
            <div className="text-sm text-black dark:text-white font-light border-l-2 border-black dark:border-white pl-3 py-2">
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
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


