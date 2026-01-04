# Supabase Email Configuration Guide

## Problem
Email confirmation links redirect to `localhost:3000` even in production.

## Solution
Configure the correct redirect URLs in your Supabase dashboard.

## Step-by-Step Fix

### 1. Configure Site URL in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/brfkcdktsuvnxmfmtmbe
2. Navigate to **Authentication** → **URL Configuration**
3. Set the **Site URL** to your production URL:
   ```
   https://your-app.vercel.app
   ```
   (Replace with your actual Vercel/deployment URL)

### 2. Add Redirect URLs

In the same **URL Configuration** section, add these to **Redirect URLs**:

```
https://your-app.vercel.app/login
https://your-app.vercel.app/login?confirmed=true
http://localhost:3000/login
http://localhost:3000/login?confirmed=true
```

**Important:** Add both production and localhost URLs so it works in both environments.

### 3. Update Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. The redirect URL in the email will automatically use your configured Site URL
4. You can customize the email template if needed

### 4. Verify Configuration

After updating:
- ✅ Site URL should be your production URL
- ✅ Redirect URLs should include both production and localhost
- ✅ Email templates should use the correct redirect URL

## How It Works

- **Site URL**: Default redirect URL for all auth operations
- **Redirect URLs**: Whitelist of allowed redirect URLs (security)
- **Email Redirect**: The code now passes `emailRedirectTo` which uses the current origin

## Testing

1. **In Production:**
   - Sign up with a new email
   - Check email for confirmation link
   - Click link → Should redirect to `https://your-app.vercel.app/login?confirmed=true`

2. **In Development:**
   - Sign up with a new email
   - Check email for confirmation link
   - Click link → Should redirect to `http://localhost:3000/login?confirmed=true`

## Troubleshooting

### Still redirecting to localhost?

1. **Check Site URL**: Make sure it's set to production URL, not localhost
2. **Check Redirect URLs**: Ensure production URL is in the whitelist
3. **Clear browser cache**: Old confirmation links might be cached
4. **Check email template**: Verify the link in the email uses the correct URL

### Links not working?

- Make sure HTTPS is enabled (required for production)
- Verify the redirect URL is in the whitelist
- Check that the URL matches exactly (no trailing slashes, correct protocol)

## Quick Checklist

- [ ] Site URL set to production URL
- [ ] Production URL added to Redirect URLs
- [ ] Localhost URL added to Redirect URLs (for development)
- [ ] Code updated to use `emailRedirectTo` option
- [ ] Tested email confirmation in production
- [ ] Tested email confirmation in development

---

**Note:** After making these changes, new signups will use the correct redirect URL. Existing confirmation links in emails will still use the old URL until new emails are sent.

