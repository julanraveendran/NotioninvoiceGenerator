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
    const vercelUrl = process.env.VERCEL_URL
    if (vercelUrl) {
      const url = vercelUrl.startsWith('https://') ? vercelUrl : `https://${vercelUrl}`
      const redirectUri = `${url}/api/auth/notion/callback`
      console.log('Using VERCEL_URL for redirect URI:', redirectUri)
      return redirectUri
    }
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
  // Debug: Log environment variable status (without exposing secrets)
  console.log('Environment check in callback:', {
    hasNotionClientId: !!process.env.NOTION_CLIENT_ID,
    notionClientIdLength: process.env.NOTION_CLIENT_ID?.length || 0,
    hasNotionClientSecret: !!process.env.NOTION_CLIENT_SECRET,
    notionClientSecretLength: process.env.NOTION_CLIENT_SECRET?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('NOTION')),
    requestUrl: request.url,
  })

  const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID
  const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET
  const REDIRECT_URI = getRedirectUri(request)

  // Debug: Log the redirect URI being used in callback
  console.log('OAuth callback - Redirect URI:', {
    redirectUri: REDIRECT_URI,
    encodedRedirectUri: encodeURIComponent(REDIRECT_URI),
    vercelUrl: process.env.VERCEL_URL,
    vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
    notionRedirectUri: process.env.NOTION_REDIRECT_URI,
    nodeEnv: process.env.NODE_ENV,
    requestOrigin: new URL(request.url).origin,
  })

  if (!NOTION_CLIENT_ID) {
    console.error('NOTION_CLIENT_ID is not set in environment variables', {
      availableEnvVars: Object.keys(process.env).filter(key => key.includes('NOTION')),
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).slice(0, 20), // First 20 env keys for debugging
    })
    return NextResponse.json(
      { error: 'OAuth configuration error: NOTION_CLIENT_ID missing' },
      { status: 500 }
    )
  }

  if (!NOTION_CLIENT_SECRET) {
    console.error('NOTION_CLIENT_SECRET is not set in environment variables', {
      availableEnvVars: Object.keys(process.env).filter(key => key.includes('NOTION')),
      nodeEnv: process.env.NODE_ENV,
    })
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

