import { NextRequest, NextResponse } from 'next/server'

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID || '2d5d872b-594c-8039-8cfd-0037ded956aa'
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET || ''
const REDIRECT_URI = process.env.NOTION_REDIRECT_URI || 'http://localhost:3001/api/auth/notion/callback'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
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
      const errorData = await tokenResponse.json()
      console.error('Token exchange error:', errorData)
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Store token in a cookie (in production, use httpOnly cookies)
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('notion_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url))
  }
}

