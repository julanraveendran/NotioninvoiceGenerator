# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- @notionhq/client (Notion API client)
- jspdf (PDF generation)
- html2canvas (HTML to image conversion)
- All other required dependencies

## Step 2: Configure Notion OAuth

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Find your integration (or create a new one)
3. Scroll to "OAuth domain & redirects" section
4. Add these exact values:

   **Website:**
   ```
   http://localhost:3000
   ```

   **Redirect URI:**
   ```
   http://localhost:3000/api/auth/notion/callback
   ```

5. Click "Save changes"

## Step 3: Create Environment File (Optional)

Create a `.env.local` file in the root directory:

```env
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback
```

**Note:** This is optional - the app defaults to `http://localhost:3000/api/auth/notion/callback` if not set.

## Step 4: Start the App

```bash
npm run dev
```

## Step 5: Open in Browser

Go to [http://localhost:3000](http://localhost:3000)

## Step 6: Test the App

1. Click "Login with Notion"
2. Authorize the app in Notion
3. You'll be redirected to the dashboard
4. Select a database from the dropdown
5. View the last 10 rows
6. (Optional) Upload a logo
7. Click "Generate Invoice" to create a PDF

## Troubleshooting

### "Not authenticated" error
- Make sure you've logged in with Notion
- Check that the redirect URI in Notion matches exactly: `http://localhost:3000/api/auth/notion/callback`

### No databases showing
- Make sure your Notion integration has access to the databases
- Check that the integration has "Read" capabilities enabled

### PDF generation fails
- Make sure you have a modern browser (Chrome, Firefox, Safari, Edge)
- Check the browser console for errors

