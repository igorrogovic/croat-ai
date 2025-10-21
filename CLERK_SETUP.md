# CRO Audit Tool - Clerk Authentication Setup

This application now includes user authentication powered by Clerk. Follow these steps to set up authentication:

## 1. Create a Clerk Account

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up for a free Clerk account
3. Create a new application

## 2. Get Your Clerk Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy your **Publishable Key** and **Secret Key**

## 3. Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Clerk keys:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
```

## 4. Configure Clerk Settings (Optional)

In your Clerk dashboard, you can customize:

- **Sign-in/Sign-up options**: Enable email, social logins (Google, GitHub, etc.)
- **User profile fields**: Customize what information to collect
- **Appearance**: Match your brand colors and styling
- **Redirects**: Set up custom redirect URLs after sign-in/sign-up

## 5. Features Enabled

With authentication enabled, users can:

- **Save audit history**: All completed audits are saved to their account
- **User-specific API keys**: Each user can set their own OpenAI API key
- **Persistent data**: Audit results and settings are preserved across sessions
- **Secure access**: Protected features require authentication

## 6. Development vs Production

- **Development**: Use test keys (pk_test_... and sk_test_...)
- **Production**: Use live keys (pk_live_... and sk_live_...) and configure your production domain in Clerk dashboard

## 7. Running the Application

After configuring your keys:

```bash
npm run dev
```

The application will now include sign-in/sign-up functionality in the header, and authenticated users will have access to their personal audit history.

## Troubleshooting

- **"Missing Clerk Publishable Key" error**: Make sure your `.env.local` file has the correct key format
- **Authentication not working**: Verify your keys are correct and your domain is configured in Clerk dashboard
- **Styling issues**: Clerk components inherit your app's styling - you can customize them in the `AuthComponent.tsx` file