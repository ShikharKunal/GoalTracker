import { differenceInDays, addDays, isBefore, startOfDay } from 'date-fns';

/**
 * Calculates the next reminder date based on the goal's duration
 * 
 * Rules:
 * - Total Duration < 1 month: Reminder every 3 days
 * - Total Duration 1 month - 6 months: Reminder every 7 days (1 week)
 * - Total Duration > 6 months: Reminder every 14 days (2 weeks)
 * 
 * @param startDate - The start date of the goal
 * @param targetEndDate - The target end date of the goal
 * @returns The next reminder date
 */
export function calculateNextReminderDate(
  startDate: Date,
  targetEndDate: Date
): Date {
  const today = startOfDay(new Date());
  const start = startOfDay(startDate);
  const end = startOfDay(targetEndDate);
  
  // Calculate total duration in days
  const totalDurationDays = differenceInDays(end, start);
  
  // Determine reminder interval based on duration
  let reminderIntervalDays: number;
  
  if (totalDurationDays < 30) {
    // Less than 1 month: every 3 days
    reminderIntervalDays = 3;
  } else if (totalDurationDays <= 180) {
    // 1 month to 6 months: every 7 days
    reminderIntervalDays = 7;
  } else {
    // More than 6 months: every 14 days
    reminderIntervalDays = 14;
  }
  
  // Calculate next reminder date
  // Start from today and find the next interval
  const daysSinceStart = differenceInDays(today, start);
  
  // If goal hasn't started yet, first reminder is one interval from start
  if (daysSinceStart < 0) {
    const firstReminder = addDays(start, reminderIntervalDays);
    return isBefore(end, firstReminder) ? end : firstReminder;
  }
  
  // Calculate how many intervals have passed
  const intervalsPassed = Math.floor(daysSinceStart / reminderIntervalDays);
  
  // Calculate the next reminder date
  let nextReminder = addDays(start, (intervalsPassed + 1) * reminderIntervalDays);
  
  // If the next reminder is after the target end date, use the target end date
  if (isBefore(end, nextReminder)) {
    return end;
  }
  
  // If the next reminder is today or in the past, move to the next interval
  if (!isBefore(today, nextReminder)) {
    nextReminder = addDays(nextReminder, reminderIntervalDays);
    // Check again if it's past the end date
    if (isBefore(end, nextReminder)) {
      return end;
    }
  }
  
  return nextReminder;
}

/**
 * Gets the reminder interval in days for a given goal duration
 */
export function getReminderInterval(totalDurationDays: number): number {
  if (totalDurationDays < 30) {
    return 3;
  } else if (totalDurationDays <= 180) {
    return 7;
  } else {
    return 14;
  }
}

