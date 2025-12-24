interface Env {
    API_KEY: string;
    ALLOWED_ORIGIN: string;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const origin = request.headers.get("Origin") || "";
        
        // Normalize origins by removing trailing slashes
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedAllowed = env.ALLOWED_ORIGIN.replace(/\/$/, '');

        // CORS Preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        // Origin Validation
        if (normalizedOrigin !== normalizedAllowed) {
            console.log(`❌ Origin mismatch: ${origin} !== ${env.ALLOWED_ORIGIN}`);
            return new Response(`Forbidden: Invalid Origin. Got: ${origin}, Expected: ${env.ALLOWED_ORIGIN}`, { status: 403 });
        }

        // Handle POST requests
        if (request.method === "POST") {
            try {
                const body = await request.json();
                console.log(`📨 Received request for model: ${body.model}`);

                // Call Google Gemini API
                const apiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${body.model}:generateContent?key=${env.API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body.payload),
                    }
                );

                const data = await apiResponse.json();
                console.log(`✅ API response received`);

                return new Response(JSON.stringify(data), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": origin,
                    },
                });
            } catch (error) {
                console.error(`❌ Error:`, error);
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
