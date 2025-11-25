# Supabase Setup Guide

This document outlines the Supabase setup for the Imali app.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to **Settings** → **API**
   - Copy the following values:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

3. Update your `.env` file with these values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Authentication Setup

The app uses Supabase Auth with email/password authentication. The following features are implemented:

- ✅ Sign Up (email/password)
- ✅ Sign In (email/password)
- ✅ Sign Out
- ✅ Password Reset (forgot password)
- ✅ Protected Routes
- ✅ Session Management

### Email Templates (Optional)

You can customize email templates in Supabase:
1. Go to **Authentication** → **Email Templates**
2. Customize the templates for:
   - Confirm signup
   - Reset password
   - Magic link (if using)

## Database Setup (Future)

The following tables will need to be created in Supabase:

1. **profiles** - User profile information
2. **buckets** - Financial buckets (Necessity, Investment, etc.)
3. **transactions** - Income and expense transactions
4. **expenses** - One-time expenses
5. **settings** - User settings (mode, currency, etc.)

## Security

- The `VITE_SUPABASE_ANON_KEY` is safe to expose in client-side code
- Row Level Security (RLS) policies should be set up for all tables
- Never commit `.env` files to version control

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test authentication flows:
   - Sign up with a new email
   - Sign in with existing credentials
   - Test password reset
   - Verify protected routes redirect to login when not authenticated

## Troubleshooting

### "Supabase environment variables are not set"
- Ensure `.env` file exists in the root directory
- Verify variable names start with `VITE_`
- Restart the development server after adding/changing `.env` variables

### Authentication not working
- Check browser console for errors
- Verify Supabase project is active
- Ensure email confirmation is disabled for testing (or check email for confirmation link)

### CORS errors
- Ensure your Supabase project allows requests from your domain
- Check Supabase project settings for allowed origins

