# Notion OAuth Setup Guide

## What to Put in Notion OAuth Settings

When setting up your Notion OAuth integration, you need to configure the following in your Notion integration settings:

### 1. Website URL
```
http://localhost:3001
```

### 2. Redirect URI
```
http://localhost:3001/api/auth/notion/callback
```

## How to Configure in Notion

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click on your integration (or create a new one)
3. Scroll down to the "OAuth domain & redirects" section
4. Add your **Website URL** in the "Website" field
5. Add your **Redirect URI** in the "Redirect URIs" field
6. Click "Save changes"

## Important Notes

- The Redirect URI must **exactly match** what you put in Notion, including the protocol (http/https) and trailing slashes
- You can add multiple redirect URIs if you're testing both locally and in production
- Make sure your integration has the necessary capabilities enabled (read databases, read pages, etc.)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NOTION_REDIRECT_URI=http://localhost:3001/api/auth/notion/callback
```

**Note:** The app will work without this file (it defaults to localhost:3001), but it's good practice to set it explicitly.

## Testing

1. Make sure your app is running (`npm run dev`)
2. Click "Login with Notion" on the landing page
3. You'll be redirected to Notion to authorize the app
4. After authorization, you'll be redirected back to the dashboard

