import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json()

    if (!prompt || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and type' },
        { status: 400 }
      )
    }

    if (type !== 'excel' && type !== 'google-sheets') {
      return NextResponse.json(
        { error: 'Type must be either "excel" or "google-sheets"' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert at Excel and Google Sheets. Output ONLY the raw formula, nothing else. Do not use markdown blocks. Do not include explanations, comments, or any additional text. Just the formula itself.`

    const userPrompt = `Generate a ${type === 'excel' ? 'Microsoft Excel' : 'Google Sheets'} formula for: ${prompt}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const formula = completion.choices[0]?.message?.content?.trim()

    if (!formula) {
      return NextResponse.json(
        { error: 'Failed to generate formula' },
        { status: 500 }
      )
    }

    return NextResponse.json({ formula })
  } catch (error) {
    console.error('Error generating formula:', error)
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

