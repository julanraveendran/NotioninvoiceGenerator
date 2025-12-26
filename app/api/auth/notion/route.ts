import { NextRequest, NextResponse } from 'next/server'

function getRedirectUri(request?: NextRequest): string {
  // Priority: explicit env var > dynamic based on environment
  if (process.env.NOTION_REDIRECT_URI) {
    console.log('Using explicit NOTION_REDIRECT_URI:', process.env.NOTION_REDIRECT_URI)
    return process.env.NOTION_REDIRECT_URI
  }

  if (process.env.NODE_ENV === 'production') {
    // Try to get the URL from the request first (most reliable)
    if (request) {
      const url = new URL(request.url)
      const origin = url.origin
      const redirectUri = `${origin}/api/auth/notion/callback`
      console.log('Using request origin for redirect URI:', redirectUri)
      return redirectUri
    }

    // Fallback: Vercel provides VERCEL_URL (e.g., 'your-app.vercel.app')
    // Note: VERCEL_URL might not include https://, so we add it
    const vercelUrl = process.env.VERCEL_URL
    if (vercelUrl) {
      // Ensure it doesn't already have https://
      const url = vercelUrl.startsWith('https://') ? vercelUrl : `https://${vercelUrl}`
      const redirectUri = `${url}/api/auth/notion/callback`
      console.log('Using VERCEL_URL for redirect URI:', redirectUri)
      return redirectUri
    }
    // Fallback: use VERCEL_BRANCH_URL if available
    const branchUrl = process.env.VERCEL_BRANCH_URL
    if (branchUrl) {
      const url = branchUrl.startsWith('https://') ? branchUrl : `https://${branchUrl}`
      const redirectUri = `${url}/api/auth/notion/callback`
      console.log('Using VERCEL_BRANCH_URL for redirect URI:', redirectUri)
      return redirectUri
    }
    console.error('Production environment detected but no VERCEL_URL found. Set NOTION_REDIRECT_URI explicitly.')
  }

  // Development default
  const devUri = 'http://localhost:3001/api/auth/notion/callback'
  console.log('Using development redirect URI:', devUri)
  return devUri
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
    const REDIRECT_URI = getRedirectUri(request)

    // Debug: Log the redirect URI being used
    console.log('OAuth initiation - Redirect URI:', {
      redirectUri: REDIRECT_URI,
      encodedRedirectUri: encodeURIComponent(REDIRECT_URI),
      vercelUrl: process.env.VERCEL_URL,
      vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
      notionRedirectUri: process.env.NOTION_REDIRECT_URI,
      nodeEnv: process.env.NODE_ENV,
    })

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
    
    console.log('Redirecting to Notion OAuth:', {
      authUrl: authUrl.substring(0, 100) + '...', // Log partial URL for debugging
      redirectUriInUrl: REDIRECT_URI,
    })
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error in OAuth initiation route:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}

