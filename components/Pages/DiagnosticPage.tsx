import React, { useState } from 'react';

const DiagnosticPage: React.FC = () => {
    const [workerUrl, setWorkerUrl] = useState(import.meta.env.VITE_WORKER_URL || 'NOT SET');
    const [testResult, setTestResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const testWorkerConnection = async () => {
        setIsLoading(true);
        setTestResult('Testing...');

        try {
            const response = await fetch(workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gemini-2.0-flash-exp',
                    payload: {
                        contents: [{ parts: [{ text: 'Hello, test message' }] }]
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                setTestResult(`✅ SUCCESS! Worker is responding.\n\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
            } else {
                const errorText = await response.text();
                setTestResult(`❌ FAILED!\n\nStatus: ${response.status}\nError: ${errorText}`);
            }
        } catch (error) {
            setTestResult(`❌ ERROR!\n\n${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold">🔍 AetherWays Diagnostic Tool</h1>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h2 className="text-2xl font-bold">Environment Variables</h2>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-slate-400">VITE_WORKER_URL:</span>
                            <span className={`font-mono text-sm ${workerUrl === 'NOT SET' ? 'text-red-400' : 'text-green-400'}`}>
                                {workerUrl}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-slate-400">VITE_SUPABASE_URL:</span>
                            <span className="font-mono text-sm text-green-400">
                                {import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h2 className="text-2xl font-bold">Worker Connection Test</h2>

                    <button
                        onClick={testWorkerConnection}
                        disabled={isLoading || workerUrl === 'NOT SET'}
                        className="px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Testing...' : 'Test Worker Connection'}
                    </button>

                    {testResult && (
                        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-700 text-sm overflow-auto max-h-96">
                            {testResult}
                        </pre>
                    )}
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h2 className="text-2xl font-bold">📋 Troubleshooting Steps</h2>

                    <ol className="list-decimal list-inside space-y-2 text-slate-300">
                        <li>Verify VITE_WORKER_URL is set above (should not be "NOT SET")</li>
                        <li>Click "Test Worker Connection" to verify the Worker is accessible</li>
                        <li>If Worker URL is NOT SET:
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Add VITE_WORKER_URL to GitHub Secrets</li>
                                <li>Trigger a new deployment (push code or manual workflow)</li>
                            </ul>
                        </li>
                        <li>If connection test fails:
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Check if Worker is deployed: <code className="text-orange-400">npx wrangler deployments list</code></li>
                                <li>Verify CORS settings in wrangler.toml</li>
                                <li>Check Worker logs: <code className="text-orange-400">npx wrangler tail</code></li>
                            </ul>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticPage;
