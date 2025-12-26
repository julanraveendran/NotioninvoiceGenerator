# Vercel Deployment Guide

## Environment Variables Setup

To deploy this app to Vercel, you need to set the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **NOTION_CLIENT_ID**
   - Your Notion OAuth Client ID
   - Found in your Notion integration settings

2. **NOTION_CLIENT_SECRET**
   - Your Notion OAuth Client Secret
   - Found in your Notion integration settings
   - ⚠️ **Never commit this to git**

3. **NOTION_REDIRECT_URI** (Optional but recommended)
   - If not set, the app will automatically use:
     - Development: `http://localhost:3001/api/auth/notion/callback`
     - Production: `https://${VERCEL_URL}/api/auth/notion/callback`
   - If you want to override, set it explicitly (e.g., `https://your-app.vercel.app/api/auth/notion/callback`)

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `NOTION_CLIENT_ID`
   - **Value**: Your client ID
   - **Environment**: Production, Preview, Development (select all)
4. Repeat for `NOTION_CLIENT_SECRET` and `NOTION_REDIRECT_URI` (if needed)

### Notion OAuth Configuration

After deploying to Vercel, update your Notion integration:

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Open your integration
3. In "OAuth domain & redirects":
   - **Website URL**: `https://your-app.vercel.app` (or your custom domain)
   - **Redirect URI**: `https://your-app.vercel.app/api/auth/notion/callback`

### Automatic Redirect URI Detection

The app automatically detects the redirect URI based on:
- **Development**: Uses `http://localhost:3001/api/auth/notion/callback`
- **Production**: Uses `https://${VERCEL_URL}/api/auth/notion/callback`

Vercel automatically provides the `VERCEL_URL` environment variable, so you don't need to set it manually.

### Troubleshooting

If you see errors in Vercel logs:
- Check that `NOTION_CLIENT_ID` and `NOTION_CLIENT_SECRET` are set
- Verify the redirect URI in Notion matches your Vercel URL
- Check Vercel function logs for detailed error messages

