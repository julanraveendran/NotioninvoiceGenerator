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
    // Fallback: use VERCEL_BRANCH_URL if available
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
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle OAuth errors from Notion
  if (error) {
    console.error('OAuth error from Notion:', error)
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    console.error('OAuth callback received without authorization code')
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  // Validate environment variables
  const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID
  const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET
  const REDIRECT_URI = getRedirectUri()

  if (!NOTION_CLIENT_ID) {
    console.error('NOTION_CLIENT_ID is not set in environment variables')
    return NextResponse.json(
      { error: 'OAuth configuration error: NOTION_CLIENT_ID missing' },
      { status: 500 }
    )
  }

  if (!NOTION_CLIENT_SECRET) {
    console.error('NOTION_CLIENT_SECRET is not set in environment variables')
    return NextResponse.json(
      { error: 'OAuth configuration error: NOTION_CLIENT_SECRET missing' },
      { status: 500 }
    )
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({ message: 'Unknown error' }))
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData,
        redirectUri: REDIRECT_URI,
        hasClientId: !!NOTION_CLIENT_ID,
        hasClientSecret: !!NOTION_CLIENT_SECRET,
      })
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      console.error('Token exchange succeeded but no access_token in response:', tokenData)
      return NextResponse.redirect(new URL('/?error=no_access_token', request.url))
    }

    const accessToken = tokenData.access_token

    // Store token in a cookie (secure in production)
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('notion_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('OAuth callback error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: code ? 'present' : 'missing',
      redirectUri: REDIRECT_URI,
    })
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url))
  }
}

