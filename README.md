# Notion Invoice Generator

A React web app that connects to Notion via OAuth, fetches data from your databases, and generates professional PDF invoices.

## Features

- 🔐 **Notion OAuth Integration** - Secure authentication with Notion
- 📊 **Database Browser** - View and select from all your Notion databases
- 📋 **Data Display** - See the last 10 rows from any database in a clean table
- 🧾 **Invoice Generation** - Generate professional PDF invoices with one click
- 🎨 **Modern Design** - Stripe-inspired invoice template
- 🖼️ **Logo Upload** - Add your company logo to invoices

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Styling
- **Notion API** - Database integration via @notionhq/client
- **jsPDF & html2canvas** - PDF generation
- **TypeScript** - Type safety
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Notion account
- A Notion OAuth integration (see [NOTION_SETUP.md](./NOTION_SETUP.md))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NOTION_CLIENT_ID=your_notion_client_id_here
NOTION_CLIENT_SECRET=your_notion_client_secret_here
NOTION_REDIRECT_URI=http://localhost:3001/api/auth/notion/callback
```

**Note:** The app includes default values for local development, but you should set these environment variables for production use.

3. Configure Notion OAuth (see [NOTION_SETUP.md](./NOTION_SETUP.md) for detailed instructions)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Login**: Click "Login with Notion" on the landing page
2. **Authorize**: Grant permissions to your Notion integration
3. **Select Database**: Choose a database from the dropdown
4. **View Data**: See the last 10 rows displayed in a table
5. **Upload Logo** (Optional): Add your company logo
6. **Generate Invoice**: Click "Generate Invoice" next to any row to download a PDF

## Notion Setup

**Important**: You must configure your Notion OAuth integration with the correct URLs.

### Website URL
```
http://localhost:3000
```

### Redirect URI
```
http://localhost:3000/api/auth/notion/callback
```

See [NOTION_SETUP.md](./NOTION_SETUP.md) for complete setup instructions.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── notion/
│   │   │       ├── route.ts              # OAuth initiation
│   │   │       └── callback/
│   │   │           └── route.ts          # OAuth callback handler
│   │   └── notion/
│   │       ├── databases/
│   │       │   └── route.ts              # Fetch all databases
│   │       └── database/
│   │           └── [databaseId]/
│   │               └── route.ts          # Fetch database rows
│   ├── dashboard/
│   │   └── page.tsx                      # Dashboard with database selector
│   ├── globals.css                       # Global styles
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Landing page
├── lib/
│   └── invoice-generator.ts              # PDF invoice generation
├── package.json
└── tailwind.config.ts                    # Tailwind configuration
```

## Environment Variables

Create a `.env.local` file with:

- `NOTION_CLIENT_ID` - Your Notion OAuth Client ID (optional, has default)
- `NOTION_CLIENT_SECRET` - Your Notion OAuth Client Secret (required for production)
- `NOTION_REDIRECT_URI` - The OAuth redirect URI (must match Notion settings, defaults to localhost:3001)

## OAuth Credentials

The OAuth client ID and secret are currently hardcoded in the API routes. In production, you should:
- Move these to environment variables
- Use secure secret management
- Never commit secrets to version control

## License

MIT
