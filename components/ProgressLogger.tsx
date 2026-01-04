'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import type { ProgressLog } from '@/types';

interface ProgressLoggerProps {
  goalId: string;
  onProgressLogged: () => void;
  onClose: () => void;
}

export default function ProgressLogger({ goalId, onProgressLogged, onClose }: ProgressLoggerProps) {
  const [percentage, setPercentage] = useState('');
  const [notes, setNotes] = useState('');
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

      const { error: insertError } = await supabase
        .from('progress_logs')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          percentage: percent,
          notes: notes.trim() || null,
          logged_at: new Date().toISOString(),
        } as any);

      if (insertError) throw insertError;

      setPercentage('');
      setNotes('');
      onProgressLogged();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-light text-black">Log Progress</h3>
      
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
            placeholder="0-100"
            required
            className="w-full bg-transparent border-0 border-b border-gray-300 pb-2 pt-1 text-sm font-light text-black focus:outline-none focus:border-black transition-colors duration-200"
          />
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max="100"
              value={percentage || 0}
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
            placeholder="Add notes about your progress..."
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
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Logging...' : 'Log Progress'}
          </Button>
        </div>
      </form>
    </div>
  );
}

