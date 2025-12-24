
import { GoogleGenAI, Type } from "@google/genai";
import { TripInput, RouteOption, TransportType } from "../types";

// Always use named parameter for apiKey and obtain it directly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRoutes = async (input: TripInput): Promise<RouteOption[]> => {
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(TransportType) },
              durationMinutes: { type: Type.NUMBER },
              totalCost: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              bookingUrl: { type: Type.STRING },
              costBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                  },
                  required: ["label", "amount"]
                }
              },
              recommendationType: { type: Type.STRING },
              recommendationReason: { type: Type.STRING }
            },
            required: ["id", "type", "durationMinutes", "totalCost", "costBreakdown", "currency", "bookingUrl"]
          }
        }
      }
    });

    const routes: RouteOption[] = JSON.parse(response.text || '[]');
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Search Source',
      uri: chunk.web?.uri || ''
    })).filter((s: any) => s.uri) || [];

    return routes.map(route => ({
      ...route,
      groundingSources: sources
    }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
