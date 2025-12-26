import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('notion_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const notion = new Client({ auth: accessToken })

    // Search for all databases
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database',
      },
    })

    const databases = response.results.map((item: any) => ({
      id: item.id,
      title: item.title?.[0]?.plain_text || 'Untitled Database',
      url: item.url,
    }))

    return NextResponse.json({ databases })
  } catch (error: any) {
    console.error('Error fetching databases:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch databases' },
      { status: 500 }
    )
  }
}

