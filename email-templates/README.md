# Imali Email Templates

This directory contains HTML email templates for Supabase authentication flows. All templates are designed to match the Imali app's branding with a teal color scheme and mobile-first responsive design.

## Available Templates

1. **confirm-signup.html** - Email verification after user signs up
2. **reset-password.html** - Password reset link
3. **magic-link.html** - Passwordless sign-in link
4. **change-email.html** - Email address change confirmation
5. **invite-user.html** - User invitation (if using Supabase team features)

## How to Use in Supabase

### Step 1: Access Email Templates in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. You'll see different template types (Confirm signup, Reset password, etc.)

### Step 2: Add Custom Templates

For each template type:

1. Click on the template type (e.g., "Confirm signup")
2. Select **Custom HTML** option
3. Copy the entire HTML content from the corresponding file in this directory
4. Paste it into the Supabase editor
5. Click **Save**

### Step 3: Template Variables

Supabase uses Go template syntax. The templates include these variables:

- `{{ .ConfirmationURL }}` - The confirmation/reset link URL
- `{{ .Email }}` - User's email address (if needed)
- `{{ .Token }}` - The token (if needed)
- `{{ .TokenHash }}` - Hashed token (if needed)
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - Redirect URL after confirmation

All templates are already configured with the correct variable placeholders.

### Step 4: Test Your Templates

1. Use Supabase's **Send test email** feature to preview
2. Test the actual flow by:
   - Signing up a new user
   - Requesting a password reset
   - Changing email address

## Customization

### Colors

The templates use Imali's brand colors:
- **Primary Teal**: `#14b8a6`
- **Dark Teal**: `#0d9488`
- **Light Teal Background**: `#f0fdfa`
- **Text Colors**: `#111827` (primary), `#4b5563` (secondary), `#6b7280` (tertiary)

### Support Email

Update the support email address in the footer of each template:
```html
<a href="mailto:support@imali.app">support@imali.app</a>
```

### Logo/Branding

Currently, templates use text-based branding. To add a logo:
1. Host your logo image (recommended: SVG or PNG)
2. Replace the header text with an `<img>` tag:
```html
<img src="https://your-domain.com/logo.png" alt="Imali" style="height: 40px;">
```

## Email Client Compatibility

These templates are designed to work across major email clients:
- ✅ Gmail (web, iOS, Android)
- ✅ Apple Mail (iOS, macOS)
- ✅ Outlook (web, desktop)
- ✅ Yahoo Mail
- ✅ Mobile email clients

The templates use:
- Table-based layouts for maximum compatibility
- Inline CSS styles
- Web-safe fonts
- Responsive design with max-width

## Notes

- All templates are mobile-responsive
- Links expire based on Supabase settings (typically 1-24 hours)
- Security notes are included in each template
- Footer includes support contact information

## Troubleshooting

### Links not working
- Ensure `{{ .ConfirmationURL }}` is correctly placed
- Check Supabase URL configuration in Authentication settings

### Styling issues
- Some email clients strip certain CSS. The templates use inline styles for compatibility
- Test in multiple email clients before deploying

### Images not loading
- Use absolute URLs (https://) for images
- Consider hosting images on a CDN
- Provide alt text for accessibility

