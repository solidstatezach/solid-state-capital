import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('investors')
      .select('id,full_name,email')
      .order('full_name')

    if (error) {
      console.error('SUPABASE ERROR:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      (data || []).map((investor) => ({
        id: investor.id,
        name: investor.full_name,
        email: investor.email,
      }))
    )
  } catch (err) {
    console.error('ROUTE ERROR:', err)

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
