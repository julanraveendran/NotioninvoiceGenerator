import { NextRequest, NextResponse } from 'next/server'

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID || '2d5d872b-594c-8039-8cfd-0037ded956aa'
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET || ''
const REDIRECT_URI = process.env.NOTION_REDIRECT_URI || 'http://localhost:3001/api/auth/notion/callback'

export async function GET(request: NextRequest) {
  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
  
  return NextResponse.redirect(authUrl)
}

