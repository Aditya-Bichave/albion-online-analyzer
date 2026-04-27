const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const INDEXNOW_KEY = '2e457296cedb4fc0a21153ca79e28266';
const INDEXNOW_HOST = 'aditya-bichave.github.io/albion-online-analyzer';
const INDEXNOW_KEY_LOCATION = `https://aditya-bichave.github.io/albion-online-analyzer/${INDEXNOW_KEY}.txt`;

export async function submitToIndexNow(urls: string[]) {
  // Skip IndexNow submission in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('[IndexNow] Skipping submission in development mode');
    return;
  }

  if (!urls || urls.length === 0) return;

  const uniqueUrls = Array.from(new Set(urls));

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: uniqueUrls,
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`IndexNow submission failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error('IndexNow error response:', errorText);
    }
  } catch (e) {
    console.error('IndexNow submission failed', e);
  }
}

