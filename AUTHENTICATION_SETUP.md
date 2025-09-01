# Mapolio Authentication Setup

## Issues Fixed

✅ **Row-Level Security (RLS) Policy Violation**: Fixed by creating proper RLS policies and auth triggers
✅ **Missing Password Field**: Implemented proper email/password authentication with Supabase Auth
✅ **No Sign-up/Sign-in Modules**: Created comprehensive authentication system with both sign-in and sign-up

## Changes Made

### 1. Updated Authentication System
- **Replaced email-only auth** with proper Supabase email/password authentication
- **Added sign-up functionality** with optional display name
- **Implemented proper session management** with auth state listeners
- **Added password field** with visibility toggle and validation

### 2. Fixed Database Security
- **Created RLS policies** for all tables (profiles, scraping_jobs, scraping_results)
- **Added auto-trigger** to create profile when user signs up
- **Implemented proper auth context** throughout the application

### 3. Updated UI Components
- **Enhanced sign-in page** with both sign-in and sign-up modes
- **Added password field** with show/hide functionality
- **Updated all components** to use the new authentication context
- **Fixed pricing calculations** (corrected from $0.03 to $0.003 per credit)

## Setup Instructions

### 1. Run Supabase Setup SQL
Execute the `supabase-auth-setup.sql` file in your Supabase SQL Editor:

```sql
-- This file contains:
-- - RLS policies for all tables
-- - Auto-trigger for profile creation
-- - Proper security policies
```

### 2. Environment Variables
Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Authentication Flow
1. **Sign Up**: Users can create account with email/password
2. **Email Confirmation**: Users receive confirmation email (if enabled)
3. **Sign In**: Users can sign in with email/password
4. **Auto Profile Creation**: Profile automatically created via database trigger
5. **Session Management**: Automatic session handling with auth state

## Features

### Sign In/Sign Up Page (`/signin`)
- **Toggle between sign-in and sign-up modes**
- **Email and password fields** with validation
- **Optional display name** for new users
- **Password visibility toggle**
- **Proper error handling** and success messages
- **Responsive design** with benefits section

### Security Features
- **Row-Level Security (RLS)** on all tables
- **Proper auth policies** - users can only access their own data
- **Auto profile creation** when new user signs up
- **Session persistence** and automatic refresh

### Updated Components
- **Navbar**: Shows different UI based on auth state
- **PricingSection**: Redirects to sign-in if not authenticated
- **UserDashboard**: Protected route for authenticated users
- **UserAccountDropdown**: Shows user info and credits
- **ProfileSettings**: Allows updating display name

## Database Schema

The system uses your existing `profiles` table with these fields:
- `id` (UUID, matches auth.users.id)
- `email` (string)
- `display_name` (string, nullable)
- `credits` (number, default 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `notification_settings` (jsonb)

## Authentication Context

All components now use the updated `useSupabase()` hook which provides:
- `user`: Supabase auth user object
- `profile`: User profile from database
- `credits`: User credit information
- `loading`: Loading state
- `signIn(email, password)`: Sign in function
- `signUp(email, password, displayName?)`: Sign up function
- `signOut()`: Sign out function
- `purchaseCredits()`: Credit purchase function
- `useCredits()`: Credit usage function
- `updateProfile()`: Profile update function

## Next Steps

1. **Run the SQL setup** in your Supabase dashboard
2. **Test the authentication flow** by creating a new account
3. **Verify RLS policies** are working by checking user data access
4. **Configure email settings** in Supabase if you want email confirmation