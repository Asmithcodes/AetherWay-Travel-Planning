interface Env {
    API_KEY: string;
    ALLOWED_ORIGIN: string;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const origin = request.headers.get("Origin") || "";

        // 1. CORS Preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        // 2. Security: Origin Validation
        if (!origin.includes(env.ALLOWED_ORIGIN)) {
            return new Response("Forbidden: Invalid Origin", { status: 403 });
        }

        // 3. Proxy Request
        if (request.method === "POST") {
            try {
                const body = await request.json();

                // Forward request to Google Gemini API with injected key
                const apiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${body.model}:generateContent?key=${env.API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body.payload),
                    }
                );

                const data = await apiResponse.json();

                return new Response(JSON.stringify(data), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
                    },
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: String(error) }), {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
                    },
                });
            }
        }

        return new Response("Method not allowed", { status: 405 });
    },
};
