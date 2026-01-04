import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goalId, goalTitle } = await request.json();

    // Get user email
    const { data: { user: userData } } = await supabase.auth.getUser();
    if (!userData?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Use Supabase Edge Function or external email service
    // For now, we'll use a simple approach with Supabase's built-in email
    // In production, you'd use SendGrid, Resend, or Supabase Edge Functions
    
    // This is a placeholder - you'll need to set up actual email sending
    // Option 1: Use Supabase Edge Function
    // Option 2: Use a service like Resend, SendGrid, etc.
    
    const emailContent = {
      to: userData.email,
      subject: `Goal Reminder: ${goalTitle}`,
      html: `
        <h2>Goal Reminder</h2>
        <p>This is a reminder to check in on your goal: <strong>${goalTitle}</strong></p>
        <p>Keep up the great work!</p>
      `,
      text: `Goal Reminder: ${goalTitle}\n\nThis is a reminder to check in on your goal. Keep up the great work!`,
    };

    // For now, we'll just log it
    // In production, integrate with your email service
    console.log('Email reminder would be sent:', emailContent);

    // TODO: Integrate with email service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'goals@yourdomain.com',
    //   to: userData.email,
    //   subject: emailContent.subject,
    //   html: emailContent.html,
    // });

    return NextResponse.json({ 
      success: true,
      message: 'Email reminder queued (email service not configured)'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

