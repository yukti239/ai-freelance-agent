<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TrustBridge AI Freelance Agent (ai-freelance-agent)

A React + Firebase app with AI-assisted project/escrow workflows.

## About this project

- Name: **TrustBridge**
- Repository: `yukti239/ai-freelance-agent`
- Owner: **yukti239**
- Live demo: configured via Vercel for easy deployment
- Tech stack: React, TypeScript, Vite, Tailwind, Firebase (Auth + Firestore), Google Gemini AI

### Key features

- Auth
  - Email/password auth using `createUserWithEmailAndPassword` and `signInWithEmailAndPassword`
  - Google sign-in through `signInWithPopup` and `GoogleAuthProvider`
  - Auth state tracking via `onAuthStateChanged`
- User roles
  - `employer` and `freelancer` roles controlled in user profile
  - Role-based route guarding for project creation
- Project lifecycle
  - Create, read, and detail views for projects (stored in Firestore/`projects`)
  - Milestone and budget management per project
  - Status updates and PFI scoring
- Wallet and escrow
  - Real-time wallet balance updates from `users` document (`walletBalance`)
  - Transaction history in Firestore `transactions` collection
  - Deposit simulation updates balance + transaction log
- AI assistant
  - `AIAssistant.tsx` full-screen chat-like module
  - Gemini `gemini-1.5-flash` model request from `@google/genai`
  - Streaming user/AI message UI with history and loading state
- Dashboard & analytics
  - `AnalyticsDashboard` summary cards (earnings, success rate, etc.)
  - Metrics computed from project and transaction data
  - Visual real-time update behavior
- UI/UX
  - Mobile-responsive Tailwind UI components
  - Custom theme, dark design, smooth transitions/animations
  - Floating AI assistant button with open/close toggle

### Architecture overview

- `src/main.tsx` initializes React + Firebase
- `src/App.tsx` handles routing, auth provider, and protected pages
- Firebase services in `src/firebase.ts`
- Page components in `src/pages` and reusable widgets in `src/components`
- Utility helpers in `src/utils`

### Firebase rules/structure

- `users/{uid}` : profile document with role, pfiScore, walletBalance frequency
- `projects/{projectId}` : project and milestone data
- `transactions/{txId}` : escrow deposit/withdraw event records

## Run locally

**Prerequisites:** Node.js, npm

1. Install dependencies:
   `npm install`
2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Set `VITE_GEMINI_API_KEY` in `.env` (from Google Gemini API key)
3. Firebase setup:
   - Open Firebase Console and select `trustbridge-378cd` project
   - Enable Authentication > Sign-in method > Google
   - Add `localhost` to Authorized domains
4. Run the app:
   `npm run dev`

## Build for production

`npm run build`

## Deploy to Vercel

1. Create a Vercel project and connect `https://github.com/yukti239/ai-freelance-agent`
2. Add env var in Vercel dashboard:
   - `VITE_GEMINI_API_KEY`
3. Deploy and confirm the site loads.

