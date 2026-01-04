export interface Goal {
  id: string; // uuid
  user_id: string; // uuid
  title: string;
  description: string | null;
  start_date: string; // ISO timestamp string
  target_end_date: string; // ISO timestamp string
  next_reminder_date: string; // ISO timestamp string
  reminder_interval_days: number | null; // Custom reminder interval, null = use default
  is_active: boolean;
  created_at?: string; // ISO timestamp string
  updated_at?: string; // ISO timestamp string
}

export interface GoalInsert {
  user_id: string;
  title: string;
  description?: string | null;
  start_date: string;
  target_end_date: string;
  next_reminder_date: string;
  reminder_interval_days?: number | null;
  is_active: boolean;
}

export interface ProgressLog {
  id: string; // uuid
  goal_id: string; // uuid
  user_id: string; // uuid
  percentage: number; // 0-100
  notes: string | null;
  logged_at: string; // ISO timestamp string
  created_at?: string; // ISO timestamp string
  updated_at?: string; // ISO timestamp string
}

export interface ProgressLogInsert {
  goal_id: string;
  user_id: string;
  percentage: number;
  notes?: string | null;
  logged_at?: string;
}
