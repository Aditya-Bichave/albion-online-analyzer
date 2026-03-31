export interface GoldPricePoint {
  price: number;
  timestamp: string; // ISO format or timestamp
}

const REGION_URLS = {
  west: 'https://west.albion-online-data.com',
  east: 'https://east.albion-online-data.com',
  europe: 'https://europe.albion-online-data.com'
};

export async function getGoldHistory(region: 'west' | 'east' | 'europe' = 'west', count: number = 24): Promise<GoldPricePoint[]> {
  try {
    const baseUrl = REGION_URLS[region];
    const url = `${baseUrl}/api/v2/stats/gold?count=${count}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      next: { revalidate: 300 },
      headers: {
        'User-Agent': 'AlbionTools/1.0 (Development)'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch gold history: ${response.status}`);
    }

    const data = await response.json();

    return data.map((item: any) => ({
      price: item.price,
      timestamp: item.timestamp
    }));
  } catch (error) {
    console.error('Gold History API Error:', error);
    return [];
  }
}
