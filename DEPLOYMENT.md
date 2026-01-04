# Deployment Guide

This guide covers deploying your Minimal Goals PWA to production.

## Prerequisites

1. ✅ Supabase project set up with database tables
2. ✅ Environment variables configured
3. ✅ VAPID keys generated (for push notifications)

## Step 1: Prepare Your Database

1. **Run the database migration:**
   - Go to your Supabase dashboard: https://supabase.com/dashboard
   - Navigate to **SQL Editor**
   - Copy and paste the contents of `supabase-migrations.sql`
   - Click **Run** to execute

2. **Verify tables are created:**
   - Check that `goals`, `push_subscriptions`, and `progress_logs` tables exist
   - Verify Row Level Security (RLS) policies are enabled

## Step 2: Environment Variables

Make sure you have these environment variables ready:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## Step 3: Choose Deployment Platform

### Option A: Vercel (Recommended for Next.js)

Vercel is the easiest option for Next.js apps and offers excellent performance.

#### Steps:

1. **Install Vercel CLI (optional, or use web interface):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI:**
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

3. **Or deploy via GitHub:**
   - Push your code to GitHub
   - Go to https://vercel.com
   - Click **New Project**
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - Click **Deploy**

4. **Configure build settings:**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

#### Vercel-specific notes:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
- ✅ PWA works out of the box

---

### Option B: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build the app:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Or use Netlify web interface:**
   - Push code to GitHub
   - Go to https://app.netlify.com
   - Click **New site from Git**
   - Connect repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables in Site settings

---

### Option C: Self-Hosted (VPS/Server)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Use a process manager (PM2 recommended):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "goal-pwa" -- start
   pm2 save
   pm2 startup
   ```

4. **Set up reverse proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Set up SSL (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Step 4: Post-Deployment Checklist

### ✅ Verify PWA Features

1. **Check service worker:**
   - Open DevTools → Application → Service Workers
   - Verify service worker is registered
   - Check offline functionality

2. **Test manifest:**
   - DevTools → Application → Manifest
   - Verify all icons and metadata

3. **Test push notifications:**
   - Enable notifications in the app
   - Verify VAPID key is working

### ✅ Test Core Features

- [ ] User authentication (sign up/sign in)
- [ ] Create goals
- [ ] Edit goals
- [ ] Delete goals
- [ ] Mark goals as complete
- [ ] Log progress
- [ ] View progress graph
- [ ] Edit/delete progress logs
- [ ] View completed goals
- [ ] Notifications (if enabled)

### ✅ Performance Check

1. **Run Lighthouse audit:**
   - Chrome DevTools → Lighthouse
   - Target: PWA, Performance, Accessibility
   - Aim for 90+ scores

2. **Check Core Web Vitals:**
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

## Step 5: Configure Custom Domain (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

## Step 6: Set Up Email Reminders (Optional)

If you want email reminders to work:

1. **Choose an email service:**
   - Resend (recommended): https://resend.com
   - SendGrid: https://sendgrid.com
   - AWS SES: https://aws.amazon.com/ses

2. **Update `/app/api/reminders/send-email/route.ts`:**
   - Add your email service SDK
   - Add API key to environment variables

3. **Add environment variable:**
   ```env
   RESEND_API_KEY=your_resend_api_key
   # or
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

## Troubleshooting

### PWA not working in production?

1. **Check HTTPS:** PWAs require HTTPS (except localhost)
2. **Verify manifest.json:** Check browser console for errors
3. **Service worker:** Check Application tab in DevTools
4. **Icons:** Ensure icon files exist in `/public`

### Build errors?

1. **Check environment variables:** All required vars must be set
2. **TypeScript errors:** Run `npm run build` locally first
3. **Missing dependencies:** Ensure `package.json` has all deps

### Slow performance?

1. **Enable caching:** Vercel/Netlify handle this automatically
2. **Optimize images:** Use Next.js Image component
3. **Check bundle size:** Run `npm run build` and check output

## Quick Deploy Commands

### Vercel (one-time setup):
```bash
npm i -g vercel
vercel login
vercel
```

### Netlify (one-time setup):
```bash
npm i -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Your Supabase anonymous key |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ⚠️ Optional | For push notifications |
| `RESEND_API_KEY` | ⚠️ Optional | For email reminders (if using Resend) |

## Support

If you encounter issues:
1. Check browser console for errors
2. Check deployment platform logs
3. Verify all environment variables are set
4. Ensure database migrations are complete

---

**Recommended:** Start with Vercel for the easiest deployment experience! 🚀

