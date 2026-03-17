# Family Planner Mobile (Expo / React Native)

## Overview
Native iOS companion app for the Family Planner web app. Recipe vault with Cook Mode, AI-powered import (URL/video/image/clipboard), and household management. Built with Expo + React Native.

## Tech Stack
- Expo SDK 55 + expo-router (file-based routing)
- TypeScript (strict)
- NativeWind v4 (Tailwind for React Native)
- Supabase JS (direct client, SecureStore for tokens)
- React Query (data fetching + caching)
- react-native-gesture-handler + react-native-reanimated (Cook Mode swipes)
- lucide-react-native (icons)
- expo-dev-client (required — native modules prevent Expo Go)

## Architecture
- **Auth**: Apple Sign-In + Google OAuth via Supabase, tokens in SecureStore
- **Data**: Direct Supabase queries for CRUD (same RLS policies as web)
- **API routes**: Calls web app's Next.js API routes over HTTPS with Bearer token for operations needing server-side secrets (recipe extraction, Spoonacular, etc.)
- **Backend**: `https://your-app.vercel.app` — no separate backend needed

## Key Commands
- `npx expo start` — start dev server (requires custom dev client)
- `npx expo prebuild` — generate native projects
- `eas build --platform ios --profile development` — dev client build
- `eas build --platform ios --profile production` — production build
- `eas submit --platform ios` — submit to App Store

## File Structure
```
app/                    # expo-router file-based routing
  (auth)/               # Login, OAuth callback
  (app)/
    (tabs)/
      recipes/          # Recipe list, detail + Cook Mode, import
      meals/            # Meal planner (v1.1)
      grocery/          # Grocery lists (v1.2)
      settings/         # API keys, household, profile
    onboarding.tsx      # Create/join household
src/
  components/
    ui/                 # Button, Card, Badge, Input, Loading, EmptyState
    recipe-card.tsx     # Recipe list card
    cook-mode.tsx       # Cook Mode (signature feature)
  hooks/                # useRecipes, useHousehold
  lib/
    supabase.ts         # Supabase client with SecureStore
    api.ts              # Authenticated fetch wrapper for Next.js API routes
    auth-context.tsx    # Auth provider + useAuth hook
    constants.ts        # Shared constants (copied from web)
    utils.ts            # Date utilities (copied from web)
  types/
    index.ts            # TypeScript interfaces (copied from web)
```

## Conventions
- Light theme (matches web app)
- Primary: purple (#7c3aed), Accent: teal
- iPad: two-column layouts where appropriate
- Haptic feedback on interactions
- expo-dev-client only (no Expo Go — native modules required)

## Backend Connection
The app connects to two backends:
1. **Supabase direct** — recipes, meal plans, grocery lists, households (all CRUD)
2. **Next.js API routes** — recipe extraction (Claude API), Spoonacular search, grocery generation

API routes authenticate via Bearer token (Supabase JWT). Set `EXPO_PUBLIC_API_URL` to your Vercel deployment URL.

## Version Plan
- v1.0: Auth, recipes, Cook Mode, import, settings (App Store submission)
- v1.1: Meal planner + share extension
- v1.2: Grocery lists + offline caching
