
import { TripInput, RouteOption, TransportType } from "../types";

// Get Worker URL from environment variables
const WORKER_URL = import.meta.env.VITE_WORKER_URL;

// Import mock service as fallback
import { generateRoutes as generateMockRoutes } from './geminiService.mock';

export const generateRoutes = async (input: TripInput): Promise<RouteOption[]> => {
  // Fallback to mock data if Worker URL is not configured
  if (!WORKER_URL || WORKER_URL === 'https://your-worker-url.workers.dev') {
    console.warn('⚠️ VITE_WORKER_URL not configured. Using mock data. Deploy Cloudflare Worker and update .env file.');
    return generateMockRoutes(input);
  }

  // Convert YYYY-MM-DD to DD-MM-YYYY for regional search compatibility (like Ixigo)
  const [year, month, day] = input.date.split('-');
  const regionalDate = `${day}-${month}-${year}`;

  const prompt = `
    TASK: Find LIVE ticket prices and FUNCTIONAL booking links for a ONE-WAY trip from ${input.origin} to ${input.destination} on ${input.date}.
    
    CRITICAL REQUIREMENTS:
    1. PRICE ACCURACY: Use Google Search to find current market rates. 
       - Calculate the TOTAL cost for ${input.travelers} traveler(s).
       - Ensure prices are for a ONE-WAY journey only (do not return round-trip prices).
       - For self-drive CAR and BIKE, calculate fuel costs based on current rates in ${input.origin}.

    2. LINK FUNCTIONALITY: Search for the actual deep-link URLs. 
       - For TRAINS (India): Use pattern https://www.ixigo.com/trains/search-pwa/from/[STATION_CODE]/to/[STATION_CODE]/${regionalDate}
       - You MUST find the correct Station Codes (e.g., HYD or SC for Hyderabad, EE for Eluru) using your search tool.
       - For FLIGHTS, find real IATA codes (e.g. HYD, BOM) and use Google Flights: https://www.google.com/travel/flights?q=flights+from+${input.origin}+to+${input.destination}+on+${input.date}+one-way
       - For self-drive CAR and BIKE: The bookingUrl MUST be a Google Maps direction link: https://www.google.com/maps/dir/${encodeURIComponent(input.origin)}/${encodeURIComponent(input.destination)}

    3. RETURN THESE OPTIONS: 
       - Flight (if applicable)
       - Train (using the ixigo search-pwa link pattern)
       - Bus (RedBus link)
       - Self-Drive CAR (Google Maps link, fuel cost breakdown)
       - Self-Drive BIKE (Google Maps link, fuel cost breakdown)

    4. Provide a 'recommendationReason' explaining the logic (e.g., "Fastest way to destination" or "Most economical for ${input.travelers} people").

    Currency: ${input.currency}.
    Return JSON only.
  `;

  const requestPayload = {
    model: "gemini-2.0-flash-exp",
    payload: {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              type: { type: "STRING" },
              durationMinutes: { type: "NUMBER" },
              totalCost: { type: "NUMBER" },
              currency: { type: "STRING" },
              bookingUrl: { type: "STRING" },
              costBreakdown: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    label: { type: "STRING" },
                    amount: { type: "NUMBER" }
                  },
                  required: ["label", "amount"]
                }
              },
              recommendationType: { type: "STRING" },
              recommendationReason: { type: "STRING" }
            },
            required: ["id", "type", "durationMinutes", "totalCost", "costBreakdown", "currency", "bookingUrl"]
          }
        }
      },
      tools: [{ googleSearch: {} }]
    }
  };

  try {
    console.log('🚀 Calling Cloudflare Worker:', WORKER_URL);

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Worker API Error:', response.status, errorText);
      throw new Error(`Worker API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Worker Response:', data);

    // Parse the response text to get routes
    const routes: RouteOption[] = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '[]');

    // Extract grounding sources
    const groundingChunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Search Source',
      uri: chunk.web?.uri || ''
    })).filter((s: any) => s.uri) || [];

    return routes.map(route => ({
      ...route,
      groundingSources: sources
    }));
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    console.warn("⚠️ Falling back to mock data due to error");
    // Fallback to mock data on error
    return generateMockRoutes(input);
  }
};
