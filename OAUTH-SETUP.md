# OAuth Setup Guide

This document explains how to configure OAuth providers (Google, Facebook, Apple) in your Supabase project.

## Prerequisites

1. A Supabase project with authentication enabled
2. OAuth provider accounts (Google, Facebook, Apple Developer)
3. Your app's redirect URL configured in Supabase

## Supabase Configuration

### 1. Enable OAuth Providers in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable the providers you want to use:
   - Google
   - Facebook
   - Apple

### 2. Configure Redirect URLs

In Supabase, go to **Authentication** → **URL Configuration** and add:

```
http://localhost:5173/auth/callback
https://yourdomain.com/auth/callback
```

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `https://gugvewyjbbulhyxaerzq.supabase.co/auth/v1/callback`
   - Your Supabase project's callback URL (found in Supabase dashboard)
7. Copy the **Client ID** and **Client Secret**

### 2. Configure in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Paste your **Client ID** and **Client Secret**
4. Save

## Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add **Facebook Login** product
4. Go to **Settings** → **Basic**
5. Add **Valid OAuth Redirect URIs**:
   - `https://gugvewyjbbulhyxaerzq.supabase.co/auth/v1/callback`
6. Copy **App ID** and **App Secret**

### 2. Configure in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers** → **Facebook**
2. Enable Facebook provider
3. Paste your **App ID** and **App Secret**
4. Save

## Apple OAuth Setup

### 1. Create Apple Service ID

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a new **Services ID**
4. Enable **Sign in with Apple**
5. Configure **Return URLs**:
   - `https://gugvewyjbbulhyxaerzq.supabase.co/auth/v1/callback`
6. Create a **Key** for Sign in with Apple
7. Download the key file (`.p8` file)

### 2. Configure in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers** → **Apple**
2. Enable Apple provider
3. Enter your **Services ID**
4. Enter your **Team ID** (found in Apple Developer account)
5. Enter your **Key ID** (from the key you created)
6. Upload or paste the contents of your `.p8` key file
7. Save

## Testing OAuth

### Development

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login` or `/signup`
3. Click on a social login button (Google, Facebook, or Apple)
4. You should be redirected to the provider's login page
5. After authentication, you'll be redirected back to `/auth/callback`
6. The app will then redirect you to `/dashboard`

### Production

1. Make sure your production domain is added to Supabase redirect URLs
2. Update the redirect URL in `AuthContext.jsx` if needed:
   ```javascript
   redirectTo: `${window.location.origin}/auth/callback`
   ```

## Troubleshooting

### "Redirect URI mismatch" error

- Ensure the redirect URI in your OAuth provider matches exactly with Supabase's callback URL
- Check that the URL is added in both:
  - OAuth provider's authorized redirect URIs
  - Supabase URL Configuration

### OAuth button doesn't redirect

- Check browser console for errors
- Verify the provider is enabled in Supabase
- Ensure Client ID/Secret are correctly entered in Supabase

### "Provider not enabled" error

- Go to Supabase dashboard → Authentication → Providers
- Make sure the provider is enabled
- Verify credentials are saved correctly

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for sensitive data in production
- Regularly rotate OAuth secrets
- Monitor OAuth usage in your Supabase dashboard

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Facebook OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Apple OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-apple)

