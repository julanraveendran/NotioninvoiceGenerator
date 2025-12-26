import { NextRequest, NextResponse } from 'next/server'

function getRedirectUri(): string {
  // Priority: explicit env var > dynamic based on environment
  if (process.env.NOTION_REDIRECT_URI) {
    return process.env.NOTION_REDIRECT_URI
  }

  if (process.env.NODE_ENV === 'production') {
    // Vercel provides VERCEL_URL (e.g., 'your-app.vercel.app')
    const vercelUrl = process.env.VERCEL_URL
    if (vercelUrl) {
      return `https://${vercelUrl}/api/auth/notion/callback`
    }
    // Fallback: use VERCEL_BRANCH_URL or construct from NEXT_PUBLIC_VERCEL_URL if available
    const branchUrl = process.env.VERCEL_BRANCH_URL
    if (branchUrl) {
      return `https://${branchUrl}/api/auth/notion/callback`
    }
    console.error('Production environment detected but no VERCEL_URL found. Set NOTION_REDIRECT_URI explicitly.')
  }

  // Development default
  return 'http://localhost:3001/api/auth/notion/callback'
}

export async function GET(request: NextRequest) {
  try {
    // Debug: Log environment variable status (without exposing secrets)
    console.log('Environment check:', {
      hasNotionClientId: !!process.env.NOTION_CLIENT_ID,
      notionClientIdLength: process.env.NOTION_CLIENT_ID?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('NOTION')),
    })

    const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID
    const REDIRECT_URI = getRedirectUri()

    if (!NOTION_CLIENT_ID) {
      console.error('NOTION_CLIENT_ID is not set in environment variables', {
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('NOTION')),
        nodeEnv: process.env.NODE_ENV,
      })
      return NextResponse.json(
        { error: 'OAuth configuration error: NOTION_CLIENT_ID missing' },
        { status: 500 }
      )
    }

    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error in OAuth initiation route:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}

