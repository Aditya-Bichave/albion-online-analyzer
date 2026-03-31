import { NextResponse } from 'next/server';
import { getTickerData } from '@/lib/ticker-service';
import { getLocale } from 'next-intl/server';

export async function GET() {
  try {
    const locale = await getLocale();
    const data = await getTickerData(locale);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch ticker data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 }
    );
  }
}
