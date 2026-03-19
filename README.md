# Family Planner Mobile

Native iOS companion for Family Planner — recipes, meal plans, grocery lists,
and to-dos with Cook Mode and AI-powered recipe import.

## Features

- **Cook Mode** — Step-by-step with swipe gestures and keep-awake
- **AI Recipe Import** — URL, TikTok/YouTube, camera, or clipboard
- **Recipe Discover** — Search Spoonacular, filter by cuisine/diet, save to vault
- **Meal Planner** — Weekly view with templates and copy-last-week
- **Smart Grocery Lists** — Auto-generate from meal plans, shopping mode
- **Shared To-Dos** — Task lists with assignments, due dates, and filters
- **Haptic Feedback** — Throughout the app for tactile interactions

## Tech Stack

- Expo SDK 55 + expo-router (file-based routing)
- TypeScript (strict)
- NativeWind v4 (Tailwind for React Native)
- Supabase (direct client + RLS)
- React Query (caching + optimistic updates)
- react-native-gesture-handler + reanimated (Cook Mode)

## Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or physical device with custom dev client
- A running instance of the [web app](https://github.com/ethancstuart/family-planner-app) (provides API routes)

## Quick Start

```bash
git clone https://github.com/ethancstuart/family-planner-mobile.git
cd family-planner-mobile
cp .env.example .env    # fill in your keys
npm install
npx expo start          # requires custom dev client (not Expo Go)
```

## Backend Connection

1. **Supabase direct** — recipes, meal plans, grocery lists, to-dos, households
2. **Next.js API routes** — AI recipe extraction, Spoonacular, grocery generation

Set `EXPO_PUBLIC_API_URL` to your Vercel deployment URL.

## Scripts

| Command | Description |
|---------|-------------|
| `npx expo start` | Start dev server |
| `npm run lint` | ESLint check |
| `npm test` | Run tests |
| `npm run format` | Prettier format |

## Related Repos

- [family-planner-app](https://github.com/ethancstuart/family-planner-app) — Next.js web app
- [family-planner-shared](https://github.com/ethancstuart/family-planner-shared) — Shared types, constants, utils

## License

MIT — see [LICENSE](LICENSE).

---

Built with [Claude Code](https://claude.ai/claude-code).
