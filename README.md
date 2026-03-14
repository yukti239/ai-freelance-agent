<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6d1523eb-279c-4371-b917-5f042f18e787

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Add your API key to `.env`: `GEMINI_API_KEY="your_actual_api_key_here"`
3. **Firebase Authentication Setup:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `trustbridge-378cd`
   - Go to Authentication > Sign-in method
   - Under "Authorized domains", add `localhost`
   - This enables Google authentication during local development
4. Run the app:
   `npm run dev`
