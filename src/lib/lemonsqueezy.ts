import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

export function configureLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (!apiKey) {
    throw new Error("Lemon Squeezy API key is missing. Please check your .env.local file.");
  }

  // Clean the API key (remove quotes, whitespace, etc.)
  const cleanApiKey = apiKey.trim().replace(/^["']|["']$/g, '');

  lemonSqueezySetup({
    apiKey: cleanApiKey,
    onError: (error) => console.error("Lemon Squeezy Error:", error),
  });
}
