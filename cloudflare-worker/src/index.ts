interface Env {
    API_KEY: string;
    ALLOWED_ORIGIN: string;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const origin = request.headers.get("Origin") || "";

        // Normalize origins by removing trailing slashes for comparison
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedAllowed = env.ALLOWED_ORIGIN.replace(/\/$/, '');

        // 1. CORS Preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        // 2. Security: Origin Validation
        if (normalizedOrigin !== normalizedAllowed) {
            console.log(`Origin mismatch: ${normalizedOrigin} !== ${normalizedAllowed}`);
            return new Response(`Forbidden: Invalid Origin. Got: ${origin}, Expected: ${env.ALLOWED_ORIGIN}`, { status: 403 });
        }

        // 3. Proxy Request
        if (request.method === "POST") {
            try {
                const body = await request.json();

                let model = body.model;

                console.log(`Proxying request for model: ${model}`);

                // Helper to perform the fetch
                const performFetch = async (targetModel: string, customPayload: any = body.payload) => {
                    return await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${env.API_KEY}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(customPayload),
                        }
                    );
                };

                // Forward request to Google Gemini API with injected key
                let apiResponse = await performFetch(model);

                // Fallback Logic: Detect 429 and switch to Lite model
                if (apiResponse.status === 429) {
                    console.warn(`[Quota Exceeded] Model ${model} returned 429. Switching to fallback: gemini-2.5-flash-lite`);
                    model = "gemini-2.5-flash-lite";

                    // FIX: Remove 'tools' from payload because Lite model + JSON Mode + Tools = 400 Error
                    const fallbackPayload = JSON.parse(JSON.stringify(body.payload));
                    delete fallbackPayload.tools; // Remove Google Search tool

                    apiResponse = await performFetch(model, fallbackPayload);
                }

                const data = await apiResponse.json();

                console.log(`API Response status: ${apiResponse.status}`);

                return new Response(JSON.stringify(data), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": origin,
                    },
                });
            } catch (error) {
                console.error(`Worker error: ${error}`);
                return new Response(JSON.stringify({ error: String(error) }), {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": origin,
                    },
                });
            }
        }

        return new Response("Method not allowed", { status: 405 });
    },
};
