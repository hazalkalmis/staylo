import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Extract hotel search filters from this query. Return ONLY valid JSON, no markdown, no explanation.

Query: "${query}"

Return this exact JSON structure:
{
  "city": "city name in English",
  "country": "country name in English", 
  "checkIn": "YYYY-MM-DD or null",
  "checkOut": "YYYY-MM-DD or null",
  "guests": number,
  "budget": { "min": number or null, "max": number or null, "currency": "EUR" },
  "priorities": ["safety", "quiet", "family", "value", "walkability", "cleanliness"],
  "mustHaves": ["pool", "breakfast", "parking", "wifi", "gym"],
  "weights": {
    "safety": 0-100,
    "quiet": 0-100,
    "family": 0-100,
    "value": 0-100,
    "walkability": 0-100,
    "cleanliness": 0-100
  }
}

Rules:
- Understand queries in any language (Turkish, English, German, French, Spanish)
- Always respond in English
- weights must sum to 100
- If not mentioned, set safety:20, quiet:20, family:10, value:25, walkability:15, cleanliness:10
- Extract dates if mentioned, otherwise null
- guests default: 2`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    // JSON parse
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const filters = JSON.parse(cleanText)

    return NextResponse.json({ filters })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 })
  }
}