# Google Authentication Setup Guide

Google authentication has been configured in your app. Follow these steps to complete the setup:

## What's Been Done ✅

1. ✅ `signInWithGoogle()` function implemented in `AuthContext.tsx`
2. ✅ Google sign-in button added to onboarding screen
3. ✅ OAuth callback handler created at `/auth/callback`
4. ✅ Deep linking configured with redirect URL: `zjfw89icva7ii8uq7vuhe://auth/callback`
5. ✅ Supabase client configured to detect session in URL

## Steps to Complete Setup

### 1. Configure Google OAuth in Supabase Dashboard

1. Go to your Supabase dashboard: https://dhasylndfvisgqbvdwbd.supabase.co
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and click to enable it
4. You'll need to create a Google Cloud Project and OAuth credentials:

### 2. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** for your project

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure the OAuth consent screen if you haven't already:
   - User Type: External (for testing) or Internal (for organization)
   - App name: "MENA Freelance Marketplace" or "Khedmah"
   - User support email: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (if External)

4. Create OAuth client IDs for each platform:

#### **Web Application** (for Supabase)
- Application type: **Web application**
- Name: "Supabase Auth"
- Authorized redirect URIs:
  ```
  https://dhasylndfvisgqbvdwbd.supabase.co/auth/v1/callback
  ```

#### **iOS** (if deploying to iOS)
- Application type: **iOS**
- Name: "MENA Marketplace iOS"
- Bundle ID: `app.rork.mena-freelance-marketplace`

#### **Android** (if deploying to Android)
- Application type: **Android**
- Name: "MENA Marketplace Android"
- Package name: `app.rork.mena_freelance_marketplace`
- SHA-1 certificate fingerprint: (Get from your keystore)

### 4. Configure Supabase with Google Credentials

1. Back in Supabase Dashboard → Authentication → Providers → Google
2. Enable the Google provider
3. Enter your **Client ID** and **Client Secret** from the Web application credentials
4. Set the **Redirect URL** (should be pre-filled):
   ```
   https://dhasylndfvisgqbvdwbd.supabase.co/auth/v1/callback
   ```
5. Click **Save**

### 5. Update app.json (IMPORTANT)

⚠️ **Note:** The app.json file is protected and needs manual update.

Add/update the `scheme` field in your `app.json`:

```json
{
  "expo": {
    "scheme": "zjfw89icva7ii8uq7vuhe",
    ...
  }
}
```

This enables deep linking for the OAuth callback.

### 6. Testing

#### On Web:
1. Run your app: `npm start` then press `w`
2. Click "Continue with Google" on the onboarding screen
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you'll be redirected back to the app

#### On Mobile (Expo Go):
1. Make sure the app.json scheme is updated
2. Run: `npm start`
3. Scan QR code with Expo Go
4. Test Google sign-in
5. You'll be redirected to browser, then back to the app after authorization

#### On Native Build:
- For production apps, you'll need to build with EAS and configure proper URL schemes

## How It Works

1. User clicks "Continue with Google"
2. App calls `signInWithGoogle()` from AuthContext
3. Supabase generates OAuth URL and opens it in browser
4. User authorizes on Google's page
5. Google redirects to: `zjfw89icva7ii8uq7vuhe://auth/callback`
6. App catches the deep link and processes it in `/app/auth/callback.tsx`
7. Session is established and user is redirected to home screen

## Troubleshooting

### "Invalid redirect URI"
- Make sure the redirect URI in Google Cloud Console matches exactly:
  `https://dhasylndfvisgqbvdwbd.supabase.co/auth/v1/callback`

### Deep link not working
- Verify `scheme` in app.json is set to: `zjfw89icva7ii8uq7vuhe`
- Restart the Expo dev server after changing app.json

### OAuth callback not processing
- Check console logs in `/app/auth/callback.tsx`
- Verify Supabase session is being created

### Rate limiting issues
- Google OAuth bypasses the rate limiting for email/password signup
- Users can use Google sign-in even if they hit the rate limit

## Additional Features

### Auto-create Profile
When a user signs in with Google for the first time, your existing auth flow will:
1. Create a profile automatically via the database trigger
2. Set default user_type to "buyer"
3. Allow user to switch to seller later

### Seller Verification
If you want Google sign-in users to be able to sign up as sellers directly:
1. You can add a parameter to track the signup intent
2. Redirect to seller verification after Google OAuth completes
3. This would require modifying the callback handler

## Production Considerations

1. **SSL Required**: OAuth only works with HTTPS in production
2. **Domain Verification**: Verify your domain in Google Cloud Console
3. **Privacy Policy**: Add your app's privacy policy URL to the OAuth consent screen
4. **Terms of Service**: Add terms of service URL
5. **Branding**: Customize OAuth consent screen with logo and colors
6. **Scopes**: Only request necessary scopes (email, profile, openid)

## Support

If you encounter issues:
1. Check Supabase Auth logs in dashboard
2. Check browser console for errors
3. Verify all redirect URLs match exactly
4. Test in incognito mode to avoid cached OAuth state
