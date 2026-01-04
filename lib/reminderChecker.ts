import { supabase } from './supabase';
import { calculateNextReminderDate } from './reminderLogic';

/**
 * Check for due reminders and send notifications
 * This should be called periodically (e.g., daily via cron job or client-side)
 */
export async function checkAndSendReminders() {
  try {
    // Get all active goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('is_active', true);

    if (goalsError) throw goalsError;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const remindersSent: string[] = [];

    for (const goal of goals || []) {
      const reminderDate = new Date(goal.next_reminder_date);
      reminderDate.setHours(0, 0, 0, 0);

      // Check if reminder is due today
      if (reminderDate.getTime() === today.getTime()) {
        // Send browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Goal Reminder: ${goal.title}`, {
            body: `Time to check in on your goal. Target: ${new Date(goal.target_end_date).toLocaleDateString()}`,
            icon: '/icon-192.png',
            tag: `goal-${goal.id}`,
          });
        }

        // Send email reminder (if configured)
        try {
          await fetch('/api/reminders/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goalId: goal.id,
              goalTitle: goal.title,
            }),
          });
        } catch (error) {
          console.error('Failed to send email reminder:', error);
        }

        // Calculate and update next reminder date
        const startDate = new Date(goal.start_date);
        const endDate = new Date(goal.target_end_date);
        const nextReminder = calculateNextReminderDate(startDate, endDate);

        await supabase
          .from('goals')
          .update({
            next_reminder_date: nextReminder.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', goal.id);

        remindersSent.push(goal.id);
      }
    }

    return { remindersSent, count: remindersSent.length };
  } catch (error: any) {
    console.error('Error checking reminders:', error);
    throw error;
  }
}

