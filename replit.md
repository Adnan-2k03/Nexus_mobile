# NexusMatch

## Overview

NexusMatch is a real-time gaming community platform built as a mobile application using Expo (React Native). It connects competitive gamers for matchmaking (LFG - Looking for Group / LFO - Looking for One), team building, and community features. The app follows a "Cyberpunk Neon" dark theme with vibrant accent colors.

Key features include:
- **Matchmaking Feed**: Real-time LFG/LFO feed where gamers post and join match requests filtered by game, region, skill level, and match type
- **Gamer Profiles**: User profiles with gamertag, preferred games, skill levels/ranks, bio, XP/leveling progression system
- **Connections & Messaging**: Send connection requests to other players, real-time chat between connected users
- **Tournaments**: Tournament discovery, team formation, and registration
- **Gamification**: In-app currency (Coins), daily rewards, XP-based leveling system

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with managed workflow, using expo-router for file-based routing
- **Navigation**: Bottom tab bar with 4 tabs (Home/Feed, Discover, Messages, Profile) plus modal screens for creating matches and editing profiles
- **Routing structure**: `app/(tabs)/` contains the main tab screens; standalone screens include `onboarding.tsx`, `create-match.tsx`, `edit-profile.tsx`, `connections.tsx`, `chat/[id].tsx`, and `player/[id].tsx`
- **State Management**: React Context (`GameContext`) manages all app state including user profile, matches, connections, conversations, and tournaments. TanStack React Query is set up via `lib/query-client.ts` for server data fetching but the current implementation primarily uses local state with AsyncStorage
- **Styling**: Plain React Native StyleSheet (not NativeWind despite the original spec). Uses a centralized color theme in `constants/colors.ts` with cyberpunk neon aesthetics
- **Fonts**: Rajdhani font family loaded via `@expo-google-fonts/rajdhani`
- **Platform support**: iOS, Android, and Web. Uses platform-specific adaptations (e.g., `KeyboardAwareScrollViewCompat` for keyboard handling, conditional blur effects)
- **Haptic feedback**: Uses `expo-haptics` throughout for tactile feedback on user interactions

### Backend (Express / Node.js)

- **Server**: Express 5 running on the same Replit instance, located in `server/`
- **Entry point**: `server/index.ts` sets up Express with CORS handling for Replit domains and localhost
- **Routes**: `server/routes.ts` - currently minimal, creates an HTTP server. All routes should be prefixed with `/api`
- **Storage**: `server/storage.ts` defines an `IStorage` interface with a `MemStorage` in-memory implementation. This is a placeholder — the app currently uses mostly client-side mock data generation via `GameContext`
- **Static serving**: In production, the server serves Expo's static web build. In development, it proxies to Metro bundler

### Data Layer

- **Client-side data**: Most data (matches, connections, conversations, tournaments) is currently generated as mock data in `lib/game-data.ts` and managed via `GameContext` with `AsyncStorage` for persistence
- **Schema**: `shared/schema.ts` defines a PostgreSQL schema using Drizzle ORM with a basic `users` table (id, username, password). This is a starting point — the schema needs expansion to match the full data model (match_requests, connections, tournaments, etc.)
- **Drizzle config**: `drizzle.config.ts` configured for PostgreSQL, reads `DATABASE_URL` from environment. Migrations output to `./migrations/`
- **Database push**: Use `npm run db:push` to push schema to the database

### Build & Development

- **Dev mode**: Two processes run simultaneously — `npm run expo:dev` for the Expo/Metro bundler and `npm run server:dev` for the Express backend
- **Production build**: `npm run expo:static:build` creates a static web build, `npm run server:build` bundles the server with esbuild, `npm run server:prod` runs the production server
- **TypeScript**: Strict mode enabled, path aliases configured (`@/*` maps to root, `@shared/*` maps to `./shared/*`)

### Key Design Decisions

1. **Mock data vs. real backend**: The app currently runs mostly on client-side mock data with AsyncStorage persistence. The Express server and Drizzle schema are scaffolded but need to be connected. Transitioning to real API calls would involve implementing routes in `server/routes.ts` and using the TanStack Query setup in `lib/query-client.ts`

2. **GameContext as central state**: All game-related state flows through a single React Context. This works for the current scale but may need refactoring to use TanStack Query mutations and server state as the backend matures

3. **File-based routing with expo-router**: Screen organization follows expo-router conventions with typed routes enabled

## External Dependencies

### Core Services
- **PostgreSQL**: Database configured via `DATABASE_URL` environment variable, managed through Drizzle ORM. Schema defined in `shared/schema.ts`
- **AsyncStorage**: Currently the primary persistence layer for user data on the client side

### Key Libraries
- **Expo SDK 54**: Core mobile framework with managed workflow
- **expo-router v6**: File-based navigation
- **Drizzle ORM + drizzle-zod**: Database ORM and schema validation
- **TanStack React Query v5**: Server state management (scaffolded, not fully utilized yet)
- **Express v5**: Backend HTTP server
- **expo-haptics**: Haptic feedback
- **expo-linear-gradient**: Gradient UI effects
- **expo-blur / expo-glass-effect**: Visual effects for tab bars and overlays
- **react-native-gesture-handler**: Gesture support
- **react-native-reanimated**: Animation library
- **react-native-keyboard-controller**: Keyboard-aware scrolling

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required for database operations)
- `EXPO_PUBLIC_DOMAIN`: Public domain for API calls from the client
- `REPLIT_DEV_DOMAIN`: Replit development domain (auto-set by Replit)
- `REPLIT_DOMAINS`: Comma-separated list of Replit domains for CORS
- `REPLIT_INTERNAL_APP_DOMAIN`: Used for production builds

### Planned but Not Yet Implemented
- Firebase Auth (Google Sign-In, Phone/OTP)
- WebSocket/Socket.io for real-time features
- 100ms SDK for voice communication
- AdMob for rewarded ads
- Push notifications