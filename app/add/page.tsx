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

      // Calculate next reminder date
      const nextReminderDate = calculateNextReminderDate(startDate, endDate);

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
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-light text-black mb-2">New Goal</h1>
          <p className="text-sm font-light text-gray-600">
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
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


