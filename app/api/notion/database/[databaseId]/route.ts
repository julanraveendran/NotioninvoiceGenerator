import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { databaseId: string } }
) {
  const accessToken = request.cookies.get('notion_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const notion = new Client({ auth: accessToken })
    const databaseId = params.databaseId

    // Query the database - get last 10 rows
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 10,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    })

    // Transform the results to a simpler format
    const rows = response.results.map((page: any) => {
      const properties = page.properties || {}
      const row: any = { id: page.id }

      // Extract common property types
      Object.keys(properties).forEach((key) => {
        const prop = properties[key]
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3ab5b589-1a1e-4c97-9ae9-6ecabd10b5bb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:36',message:'Processing property',data:{key,propType:prop.type,propValue:prop.type==='number'?prop.number:prop},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        if (prop.type === 'title' && prop.title?.[0]) {
          row.name = prop.title[0].plain_text
        } else if (prop.type === 'rich_text' && prop.rich_text?.[0]) {
          row[key] = prop.rich_text[0].plain_text
        } else if (prop.type === 'date' && prop.date) {
          row.date = prop.date.start
        } else if (prop.type === 'number') {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3ab5b589-1a1e-4c97-9ae9-6ecabd10b5bb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:45',message:'Setting amount from number field (post-fix)',data:{key,numberValue:prop.number,numberType:typeof prop.number,isNull:prop.number===null,isUndefined:prop.number===undefined,willSet:prop.number!=null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
          // Only set amount if it's not null (Notion returns null for empty number fields)
          if (prop.number != null) {
            row.amount = prop.number
          }
        } else if (prop.type === 'select' && prop.select) {
          row[key] = prop.select.name
        } else if (prop.type === 'multi_select' && prop.multi_select) {
          row[key] = prop.multi_select.map((s: any) => s.name).join(', ')
        }
      })
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3ab5b589-1a1e-4c97-9ae9-6ecabd10b5bb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:54',message:'Row transformation complete',data:{rowId:row.id,rowAmount:row.amount,amountType:typeof row.amount,amountIsNull:row.amount===null,amountIsUndefined:row.amount===undefined,fullRow:row},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion

      return row
    })

    return NextResponse.json({ rows })
  } catch (error: any) {
    console.error('Error fetching database:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch database' },
      { status: 500 }
    )
  }
}

