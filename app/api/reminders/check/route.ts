import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateNextReminderDate } from '@/lib/reminderLogic';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a Supabase client with the auth token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active goals for the user
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (goalsError) throw goalsError;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const remindersToSend: any[] = [];

    for (const goal of goals || []) {
      const reminderDate = new Date(goal.next_reminder_date);
      reminderDate.setHours(0, 0, 0, 0);

      // Check if reminder is due today
      if (reminderDate.getTime() === today.getTime()) {
        remindersToSend.push(goal);

        // Calculate next reminder date
        const startDate = new Date(goal.start_date);
        const endDate = new Date(goal.target_end_date);
        const nextReminder = calculateNextReminderDate(startDate, endDate);

        // Update goal with next reminder date
        await supabase
          .from('goals')
          .update({ 
            next_reminder_date: nextReminder.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', goal.id);
      }
    }

    return NextResponse.json({ 
      reminders: remindersToSend,
      count: remindersToSend.length 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

