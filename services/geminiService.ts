
const getTargetYear = () => {
  const now = new Date();
  // July or later? Prepare for the next year. 
  // Jan-June? Still celebrating the current year.
  return now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
};

// Browser-safe helper that calls the server endpoint at `/api/gemini`.
export async function generateText(prompt: string): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    let errMsg = 'Gemini request failed';
    try {
      const errBody = await response.json();
      errMsg = errBody.error || errMsg;
    } catch (e) {
      // ignore JSON parse errors
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.text;
}

/**
 * Orchestrates the creation of bespoke New Year sentiments.
 */
export const generateNewYearWish = async (name: string, relationship: string): Promise<string> => {
  const year = getTargetYear();
  const prompt = `Compose a unique, celebratory, and deeply heartwarming Happy New Year message for ${year} for my ${relationship} named ${name}. The message should feel personal, high-end, and emotionally resonant. Keep it concise (under 40 words). Do not include hashtags.`;

  try {
    const text = await generateText(prompt);
    return text || `To ${name}, may ${year} be a year of incredible beauty and joy for you.`;
  } catch (error) {
    console.error('Composition error:', error);
    return `Wishing you a magnificent ${year} filled with joy and success, ${name}!`;
  }
};

/**
 * Identifies the city and country from coordinates using Gemini.
 * This provides a much more accurate "Luxury" feel than simple timezone offsets.
 */
export const getCityFromCoords = async (lat: number, lng: number): Promise<string> => {
  const prompt = `Based on the coordinates Lat: ${lat}, Lng: ${lng}, what is the name of the city and country? Return ONLY the \"City, Country\" name (e.g., \"Accra, Ghana\"). No other text.`;

  try {
    const text = await generateText(prompt);
    return (text || 'Local Timezone').trim();
  } catch (err) {
    console.error('Location lookup error:', err);
    // Fall back to a simple timezone/local label handled by the client
    return 'Your Location';
  }
};
