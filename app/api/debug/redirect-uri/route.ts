import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This endpoint helps debug the redirect URI issue
  const vercelUrl = process.env.VERCEL_URL
  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL
  const notionRedirectUri = process.env.NOTION_REDIRECT_URI
  const nodeEnv = process.env.NODE_ENV

  function getRedirectUri(): string {
    if (process.env.NOTION_REDIRECT_URI) {
      return process.env.NOTION_REDIRECT_URI
    }

    if (process.env.NODE_ENV === 'production') {
      const vercelUrl = process.env.VERCEL_URL
      if (vercelUrl) {
        const url = vercelUrl.startsWith('https://') ? vercelUrl : `https://${vercelUrl}`
        return `${url}/api/auth/notion/callback`
      }
      const branchUrl = process.env.VERCEL_BRANCH_URL
      if (branchUrl) {
        const url = branchUrl.startsWith('https://') ? branchUrl : `https://${branchUrl}`
        return `${url}/api/auth/notion/callback`
      }
    }

    return 'http://localhost:3001/api/auth/notion/callback'
  }

  const computedRedirectUri = getRedirectUri()

  return NextResponse.json({
    computedRedirectUri,
    encodedRedirectUri: encodeURIComponent(computedRedirectUri),
    environment: {
      nodeEnv,
      vercelUrl,
      vercelBranchUrl,
      notionRedirectUri,
    },
    instructions: {
      step1: 'Copy the "computedRedirectUri" value above',
      step2: 'Go to https://www.notion.so/my-integrations',
      step3: 'Open your integration settings',
      step4: 'In "OAuth domain & redirects", set Redirect URI to the computedRedirectUri value',
      step5: 'Make sure it matches EXACTLY (including https:// and no trailing slash)',
    },
  })
}

