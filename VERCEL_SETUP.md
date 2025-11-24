# Vercel Deployment Setup

## Environment Variables

Make sure to add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### How to get your Supabase credentials:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Important Notes

- These variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- After adding environment variables, you need to **redeploy** your application for changes to take effect
- Make sure the Supabase project URL and keys match between local and production

## Troubleshooting Login Issues

If login works locally but not in production:

1. ✅ Verify environment variables are set correctly in Vercel
2. ✅ Check that the Supabase project URL is correct (should be `https://xxxxx.supabase.co`)
3. ✅ Ensure the anon key matches your Supabase project
4. ✅ Redeploy after adding/changing environment variables
5. ✅ Check browser console for any error messages
6. ✅ Verify Supabase Auth settings allow your Vercel domain

## Supabase Auth Configuration

In your Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel domain to **Site URL** (e.g., `https://your-app.vercel.app`)
3. Add redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**` (for wildcard)

