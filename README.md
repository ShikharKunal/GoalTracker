# Minimal Goals - A Minimalist Long-Term Goal Tracker PWA

A minimalist Progressive Web App for tracking long-term goals with intelligent reminder intervals.

## Features

- **Minimalist Design**: Clean, monochromatic UI with ample whitespace
- **Smart Reminders**: Automatically calculates reminder intervals based on goal duration
- **PWA Support**: Works offline and can be installed on mobile devices
- **Long-Term Focus**: Designed for goals spanning weeks to years
- **Goal Management**: Create, edit, delete, and complete goals
- **Goal Descriptions**: Add optional descriptions to your goals
- **Push Notifications**: Browser push notifications for goal reminders
- **Email Reminders**: Email notifications for goal check-ins (configurable)
- **Real-time Updates**: Automatic reminder checking and notifications

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase project URL and anon key:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - (Optional) For push notifications, add VAPID public key:
     ```
     NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
     ```
   - (Optional) For email reminders, add your email service API key (see Email Setup section)

3. **Set up Supabase database:**
   
   Run the SQL from `supabase-migrations.sql` in your Supabase SQL editor, or copy the contents:
   
   This will create:
   - `goals` table for storing user goals
   - `push_subscriptions` table for push notification subscriptions
   - Row Level Security policies for both tables

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Reminder Logic

The app automatically calculates reminder intervals based on goal duration:

- **< 1 month**: Reminder every 3 days
- **1-6 months**: Reminder every 7 days (1 week)
- **> 6 months**: Reminder every 14 days (2 weeks)

## Project Structure

```
├── app/
│   ├── add/          # Goal creation page
│   ├── layout.tsx    # Root layout with PWA meta tags
│   ├── page.tsx      # Dashboard/home page
│   └── globals.css   # Global styles
├── components/
│   └── ui/           # Minimal UI components (Button, Input, Card)
├── hooks/
│   └── useNotifications.ts  # Notification hook scaffold
├── lib/
│   ├── reminderLogic.ts     # Reminder calculation logic
│   └── supabase.ts          # Supabase client
└── types/
    ├── index.ts      # TypeScript interfaces
    └── supabase.ts   # Supabase type definitions
```

## Building for Production

```bash
npm run build
npm start
```

The PWA will be fully functional in production mode with service worker caching enabled.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel:**
1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables
5. Deploy!

For other platforms (Netlify, self-hosted) and detailed instructions, see the deployment guide.

## Push Notifications Setup

To enable push notifications:

1. **Generate VAPID Keys:**
   ```bash
   npm install -g web-push
   web-push generate-vapid-keys
   ```

2. **Add to `.env.local`:**
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
   ```
   (Keep the private key secure - you'll need it for sending push notifications from a server)

3. **Enable notifications in the app:**
   - Click "Enable Notifications" button on the home page
   - Grant permission when prompted

## Email Reminders Setup

Email reminders are scaffolded but require an email service integration. Options:

### Option 1: Resend (Recommended)
1. Sign up at https://resend.com
2. Get your API key
3. Update `/app/api/reminders/send-email/route.ts` to use Resend:
   ```typescript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   await resend.emails.send({ ... });
   ```

### Option 2: SendGrid
1. Sign up at https://sendgrid.com
2. Get your API key
3. Update the email route to use SendGrid SDK

### Option 3: Supabase Edge Functions
1. Create a Supabase Edge Function for sending emails
2. Call it from the email route

## Features Overview

### Goal Management
- ✅ Create goals with title, description, and target date
- ✅ Edit existing goals
- ✅ Delete goals
- ✅ Mark goals as complete
- ✅ View all active goals

### Notifications
- ✅ Browser push notifications (requires VAPID keys)
- ✅ Local browser notifications (works without VAPID)
- ✅ Email reminders (requires email service setup)
- ✅ Automatic reminder checking (runs hourly)

### Reminders
- ✅ Smart interval calculation based on goal duration
- ✅ Automatic next reminder date calculation
- ✅ Real-time reminder checking

## Notes

- PWA features are disabled in development mode (as per next-pwa best practices)
- Service worker is automatically generated during build
- Push notifications require VAPID keys (see Push Notifications Setup)
- Email reminders require email service integration (see Email Reminders Setup)
- Reminders are checked hourly when the app is open


